import asyncio
import time
from datetime import datetime
from redis_monitor import RedisMonitor
import logging

class RedisScheduler:
    def __init__(self, redis_monitor: RedisMonitor):
        """Redis 스케줄러 초기화"""
        self.redis_monitor = redis_monitor
        self.logger = logging.getLogger('redis_scheduler')
        self.running = False
        self.tasks = []
        
        # 스케줄 설정
        self.cleanup_interval = 3600  # 1시간마다 정리
        self.health_check_interval = 300  # 5분마다 상태 확인
        self.backup_interval = 86400  # 24시간마다 백업
    
    async def start(self):
        """스케줄러 시작"""
        self.running = True
        self.logger.info("Redis scheduler started")
        
        # 여러 태스크를 동시에 실행
        self.tasks = [
            asyncio.create_task(self._cleanup_loop()),
            asyncio.create_task(self._health_check_loop()),
            asyncio.create_task(self._backup_loop())
        ]
        
        try:
            await asyncio.gather(*self.tasks)
        except Exception as e:
            self.logger.error(f"Scheduler error: {e}")
    
    async def stop(self):
        """스케줄러 중지"""
        self.running = False
        self.logger.info("Redis scheduler stopped")
        
        # 모든 태스크 취소
        for task in self.tasks:
            task.cancel()
        
        # 태스크들이 완전히 종료될 때까지 대기
        await asyncio.gather(*self.tasks, return_exceptions=True)
    
    async def _cleanup_loop(self):
        """자동 정리 루프"""
        while self.running:
            try:
                if self.redis_monitor.auto_cleanup_enabled:
                    self.logger.info("Running automatic cleanup...")
                    result = self.redis_monitor.cleanup_expired_sessions()
                    self.logger.info(f"Cleanup result: {result}")
                
                await asyncio.sleep(self.cleanup_interval)
            except Exception as e:
                self.logger.error(f"Cleanup loop error: {e}")
                await asyncio.sleep(60)  # 에러 시 1분 대기
    
    async def _health_check_loop(self):
        """상태 확인 루프"""
        while self.running:
            try:
                if self.redis_monitor.monitoring_enabled:
                    health = self.redis_monitor.get_health_status()
                    
                    # 상태에 따른 로깅
                    if health.get("status") == "critical":
                        self.logger.critical(f"Redis critical status: {health}")
                    elif health.get("status") == "warning":
                        self.logger.warning(f"Redis warning status: {health}")
                    else:
                        self.logger.debug(f"Redis health check: {health.get('status')}")
                
                await asyncio.sleep(self.health_check_interval)
            except Exception as e:
                self.logger.error(f"Health check loop error: {e}")
                await asyncio.sleep(60)
    
    async def _backup_loop(self):
        """자동 백업 루프"""
        while self.running:
            try:
                # 매일 자정에 백업
                now = datetime.now()
                if now.hour == 0 and now.minute < 5:  # 자정 0-5분 사이
                    self.logger.info("Running automatic backup...")
                    result = self.redis_monitor.backup_conversations()
                    self.logger.info(f"Backup result: {result}")
                    
                    # 백업 후 1시간 대기 (중복 실행 방지)
                    await asyncio.sleep(3600)
                else:
                    await asyncio.sleep(300)  # 5분마다 확인
                    
            except Exception as e:
                self.logger.error(f"Backup loop error: {e}")
                await asyncio.sleep(300)
    
    async def run_manual_cleanup(self):
        """수동 정리 실행"""
        try:
            result = self.redis_monitor.cleanup_expired_sessions()
            self.logger.info(f"Manual cleanup result: {result}")
            return result
        except Exception as e:
            self.logger.error(f"Manual cleanup error: {e}")
            return {"error": str(e)}
    
    async def run_manual_backup(self, backup_name: str = None):
        """수동 백업 실행"""
        try:
            result = self.redis_monitor.backup_conversations(backup_name)
            self.logger.info(f"Manual backup result: {result}")
            return result
        except Exception as e:
            self.logger.error(f"Manual backup error: {e}")
            return {"error": str(e)}
    
    def get_scheduler_status(self):
        """스케줄러 상태 반환"""
        return {
            "running": self.running,
            "monitoring_enabled": self.redis_monitor.monitoring_enabled,
            "auto_cleanup_enabled": self.redis_monitor.auto_cleanup_enabled,
            "cleanup_interval": self.cleanup_interval,
            "health_check_interval": self.health_check_interval,
            "backup_interval": self.backup_interval,
            "active_tasks": len(self.tasks)
        } 