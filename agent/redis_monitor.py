import redis
import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging
from pathlib import Path

class RedisMonitor:
    def __init__(self, redis_url: str = None):
        """Redis 모니터링 및 관리 시스템 초기화"""
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = self._get_redis_client()
        
        # 로깅 설정
        self.logger = self._setup_logger()
        
        # 모니터링 설정
        self.monitoring_enabled = True
        self.auto_cleanup_enabled = True
        self.cleanup_interval = 3600  # 1시간마다 정리
        
        # 백업 설정
        self.backup_dir = Path("backups")
        self.backup_dir.mkdir(exist_ok=True)
        
        # 메모리 제한 설정
        self.max_memory_mb = int(os.getenv("REDIS_MAX_MEMORY_MB", "512"))
        self.memory_warning_threshold = 0.8  # 80% 사용 시 경고
    
    def _get_redis_client(self) -> redis.Redis:
        """Redis 클라이언트 생성"""
        try:
            if self.redis_url.startswith("redis://"):
                from urllib.parse import urlparse
                parsed = urlparse(self.redis_url)
                
                return redis.Redis(
                    host=parsed.hostname or 'localhost',
                    port=parsed.port or 6379,
                    db=0,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
            else:
                return redis.Redis(
                    host='localhost',
                    port=6379,
                    db=0,
                    decode_responses=True
                )
        except Exception as e:
            self.logger.error(f"Redis connection failed: {e}")
            raise
    
    def _setup_logger(self) -> logging.Logger:
        """로거 설정"""
        logger = logging.getLogger('redis_monitor')
        logger.setLevel(logging.INFO)
        
        # 파일 핸들러
        log_file = Path("logs/redis_monitor.log")
        log_file.parent.mkdir(exist_ok=True)
        
        handler = logging.FileHandler(log_file)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def get_health_status(self) -> Dict[str, Any]:
        """Redis 상태 확인"""
        try:
            # 연결 테스트
            self.client.ping()
            
            # 기본 정보
            info = self.client.info()
            memory_info = self.client.info('memory')
            
            # 메모리 사용량 계산
            used_memory_mb = memory_info['used_memory'] / (1024 * 1024)
            max_memory_mb = memory_info.get('maxmemory', 0) / (1024 * 1024)
            memory_usage_percent = (used_memory_mb / max_memory_mb * 100) if max_memory_mb > 0 else 0
            
            # 키 통계
            total_keys = self.client.dbsize()
            session_keys = len(self.client.keys('chat_session:*'))
            
            # 성능 지표
            ops_per_sec = info.get('instantaneous_ops_per_sec', 0)
            connected_clients = info.get('connected_clients', 0)
            
            # 상태 판단
            status = "healthy"
            if memory_usage_percent > 90:
                status = "critical"
            elif memory_usage_percent > 80:
                status = "warning"
            
            return {
                "status": status,
                "timestamp": datetime.now().isoformat(),
                "memory": {
                    "used_mb": round(used_memory_mb, 2),
                    "max_mb": round(max_memory_mb, 2),
                    "usage_percent": round(memory_usage_percent, 2),
                    "warning_threshold": self.memory_warning_threshold * 100
                },
                "keys": {
                    "total": total_keys,
                    "sessions": session_keys
                },
                "performance": {
                    "ops_per_sec": ops_per_sec,
                    "connected_clients": connected_clients,
                    "uptime_seconds": info.get('uptime_in_seconds', 0)
                },
                "monitoring": {
                    "enabled": self.monitoring_enabled,
                    "auto_cleanup": self.auto_cleanup_enabled
                }
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def get_session_statistics(self) -> Dict[str, Any]:
        """세션 통계 정보"""
        try:
            session_keys = self.client.keys('chat_session:*')
            session_stats = {}
            
            for key in session_keys:
                session_id = key.replace('chat_session:', '')
                message_count = self.client.llen(key)
                ttl = self.client.ttl(key)
                
                session_stats[session_id] = {
                    "message_count": message_count,
                    "ttl_seconds": ttl,
                    "created_at": datetime.now() - timedelta(seconds=86400-ttl) if ttl > 0 else None
                }
            
            # 통계 계산
            total_sessions = len(session_stats)
            total_messages = sum(stats["message_count"] for stats in session_stats.values())
            avg_messages_per_session = total_messages / total_sessions if total_sessions > 0 else 0
            
            return {
                "total_sessions": total_sessions,
                "total_messages": total_messages,
                "avg_messages_per_session": round(avg_messages_per_session, 2),
                "sessions": session_stats
            }
            
        except Exception as e:
            self.logger.error(f"Session statistics failed: {e}")
            return {"error": str(e)}
    
    def cleanup_expired_sessions(self) -> Dict[str, Any]:
        """만료된 세션 정리"""
        try:
            session_keys = self.client.keys('chat_session:*')
            cleaned_count = 0
            expired_count = 0
            
            for key in session_keys:
                ttl = self.client.ttl(key)
                
                if ttl == -2:  # 이미 만료된 키
                    self.client.delete(key)
                    expired_count += 1
                elif ttl == -1:  # TTL이 설정되지 않은 키
                    self.client.expire(key, 86400)  # 24시간 설정
                    cleaned_count += 1
            
            result = {
                "cleaned_sessions": cleaned_count,
                "expired_sessions": expired_count,
                "total_processed": len(session_keys),
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Cleanup completed: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Cleanup failed: {e}")
            return {"error": str(e)}
    
    def backup_conversations(self, backup_name: str = None) -> Dict[str, Any]:
        """대화 기록 백업"""
        try:
            if not backup_name:
                backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            backup_file = self.backup_dir / f"{backup_name}.json"
            session_keys = self.client.keys('chat_session:*')
            backup_data = {
                "backup_info": {
                    "created_at": datetime.now().isoformat(),
                    "total_sessions": len(session_keys),
                    "redis_url": self.redis_url
                },
                "sessions": {}
            }
            
            for key in session_keys:
                session_id = key.replace('chat_session:', '')
                conversation = self.client.lrange(key, 0, -1)
                ttl = self.client.ttl(key)
                
                backup_data["sessions"][session_id] = {
                    "conversation": conversation,
                    "ttl": ttl,
                    "message_count": len(conversation)
                }
            
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(backup_data, f, ensure_ascii=False, indent=2)
            
            result = {
                "backup_file": str(backup_file),
                "total_sessions": len(session_keys),
                "file_size_mb": round(backup_file.stat().st_size / (1024 * 1024), 2),
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Backup completed: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Backup failed: {e}")
            return {"error": str(e)}
    
    def restore_conversations(self, backup_file: str) -> Dict[str, Any]:
        """대화 기록 복구"""
        try:
            backup_path = Path(backup_file)
            if not backup_path.exists():
                return {"error": f"Backup file not found: {backup_file}"}
            
            with open(backup_path, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            restored_count = 0
            total_messages = 0
            
            for session_id, session_data in backup_data["sessions"].items():
                key = f'chat_session:{session_id}'
                conversation = session_data["conversation"]
                
                # 기존 세션 삭제 후 복구
                self.client.delete(key)
                
                for message in conversation:
                    self.client.rpush(key, message)
                
                # TTL 설정
                ttl = session_data.get("ttl", 86400)
                if ttl > 0:
                    self.client.expire(key, ttl)
                
                restored_count += 1
                total_messages += len(conversation)
            
            result = {
                "restored_sessions": restored_count,
                "total_messages": total_messages,
                "backup_file": backup_file,
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Restore completed: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Restore failed: {e}")
            return {"error": str(e)}
    
    def set_memory_limit(self, max_memory_mb: int) -> Dict[str, Any]:
        """메모리 제한 설정"""
        try:
            max_memory_bytes = max_memory_mb * 1024 * 1024
            self.client.config_set('maxmemory', max_memory_bytes)
            self.client.config_set('maxmemory-policy', 'allkeys-lru')
            
            self.max_memory_mb = max_memory_mb
            
            result = {
                "max_memory_mb": max_memory_mb,
                "max_memory_bytes": max_memory_bytes,
                "policy": "allkeys-lru",
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Memory limit set: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Memory limit setting failed: {e}")
            return {"error": str(e)}
    
    def get_backup_list(self) -> List[Dict[str, Any]]:
        """백업 파일 목록"""
        try:
            backup_files = []
            for backup_file in self.backup_dir.glob("*.json"):
                stat = backup_file.stat()
                backup_files.append({
                    "filename": backup_file.name,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
            
            return sorted(backup_files, key=lambda x: x["created_at"], reverse=True)
            
        except Exception as e:
            self.logger.error(f"Backup list failed: {e}")
            return []
    
    def delete_backup(self, backup_name: str) -> Dict[str, Any]:
        """백업 파일 삭제"""
        try:
            backup_file = self.backup_dir / backup_name
            if not backup_file.exists():
                return {"error": f"Backup file not found: {backup_name}"}
            
            backup_file.unlink()
            
            result = {
                "deleted_file": backup_name,
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Backup deleted: {result}")
            return result
            
        except Exception as e:
            self.logger.error(f"Backup deletion failed: {e}")
            return {"error": str(e)}
    
    def start_monitoring(self):
        """모니터링 시작"""
        self.monitoring_enabled = True
        self.logger.info("Redis monitoring started")
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitoring_enabled = False
        self.logger.info("Redis monitoring stopped")
    
    def enable_auto_cleanup(self):
        """자동 정리 활성화"""
        self.auto_cleanup_enabled = True
        self.logger.info("Auto cleanup enabled")
    
    def disable_auto_cleanup(self):
        """자동 정리 비활성화"""
        self.auto_cleanup_enabled = False
        self.logger.info("Auto cleanup disabled") 