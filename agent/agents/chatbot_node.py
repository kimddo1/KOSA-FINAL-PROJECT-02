from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from .memory_manager import ConversationMemory
from .rag_system import RAGSystem
import os
import redis
import json

# Redis 연결 (싱글턴)
_redis_client = None
def get_redis_client():
    global _redis_client
    if _redis_client is None:
        # 환경변수에서 Redis URL 읽기 (Docker 환경용)
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        if redis_url.startswith("redis://"):
            # redis:// 형식 파싱
            from urllib.parse import urlparse
            parsed = urlparse(redis_url)
            _redis_client = redis.Redis(
                host=parsed.hostname or 'localhost',
                port=parsed.port or 6379,
                db=0,
                decode_responses=True
            )
        else:
            # 기존 방식 (host:port)
            _redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    return _redis_client

# 세션별 대화 기록 저장
REDIS_SESSION_PREFIX = 'chat_session:'
REDIS_SESSION_TTL = 60 * 60 * 24  # 24시간

def save_message_to_history(session_id, role, message):
    client = get_redis_client()
    key = REDIS_SESSION_PREFIX + session_id
    entry = json.dumps({'role': role, 'message': message})
    client.rpush(key, entry)
    client.expire(key, REDIS_SESSION_TTL)

def get_conversation_history(session_id, limit=10):
    client = get_redis_client()
    key = REDIS_SESSION_PREFIX + session_id
    entries = client.lrange(key, -limit, -1)
    return [json.loads(e) for e in entries]

class ChatbotNode:
    def __init__(self):
        """챗봇 노드 초기화"""
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.memory = ConversationMemory()
        self.rag_system = RAGSystem()
        
        # 페이지별 시스템 프롬프트
        self.page_prompts = {
            '/': "메인 홈페이지입니다. 코크루트 서비스 소개와 주요 기능을 안내해주세요.",
            '/login': "로그인 페이지입니다. 로그인 방법과 계정 관련 도움을 제공해주세요.",
            '/signup': "회원가입 페이지입니다. 가입 절차와 필요한 정보를 안내해주세요.",
            '/joblist': "채용공고 목록 페이지입니다. 채용공고 검색과 필터링 방법을 도와주세요.",
            '/mypage': "마이페이지입니다. 개인정보 관리와 설정 변경을 도와주세요.",
            '/corporatehome': "기업 홈페이지입니다. 기업용 기능과 채용 관리 도구를 안내해주세요.",
            '/applicantlist': "지원자 목록 페이지입니다. 지원자 관리와 이력서 검토를 도와주세요.",
            '/postrecruitment': "채용공고 등록 페이지입니다. 공고 작성과 등록 방법을 안내해주세요.",
            '/email': "이메일 발송 페이지입니다. 지원자에게 이메일 발송 방법을 도와주세요.",
            '/managerschedule': "매니저 일정 관리 페이지입니다. 면접 일정 관리와 조율을 도와주세요.",
            '/memberschedule': "멤버 일정 관리 페이지입니다. 개인 일정 관리와 확인을 도와주세요."
        }
        
        # 기본 시스템 프롬프트
        self.base_system_prompt = """당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 
        사용자와의 대화를 기억하고, 제공된 컨텍스트 정보를 활용하여 정확하고 유용한 답변을 제공하세요.
        
        대화 규칙:
        1. 항상 친근하고 도움이 되는 톤을 유지하세요
        2. 이전 대화 내용을 참고하여 맥락에 맞는 답변을 제공하세요
        3. 제공된 컨텍스트 정보가 있다면 그것을 활용하세요
        4. 모르는 내용에 대해서는 솔직하게 말하고, 가능한 정보를 제공하세요
        5. 사용자가 명확하지 않은 질문을 했을 때는 구체적으로 질문하여 명확히 하세요
        6. 현재 페이지 정보를 활용하여 페이지별 맞춤 도움을 제공하세요"""
    
    def __call__(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """챗봇 노드 실행"""
        try:
            # 상태에서 필요한 정보 추출
            user_message = state.get("user_message", "")
            session_id = state.get("session_id", "default_session")
            page_context = state.get("page_context", {})
            
            if not user_message:
                return {
                    **state,
                    "ai_response": "안녕하세요! 무엇을 도와드릴까요?",
                    "context_used": ""
                }
            
            # 1. 이전 대화 기록 불러오기
            history = get_conversation_history(session_id, limit=10)
            history_prompt = ''
            for h in history:
                if h['role'] == 'user':
                    history_prompt += f"User: {h['message']}\n"
                else:
                    history_prompt += f"AI: {h['message']}\n"
            
            # 2. 이번 메시지 저장
            save_message_to_history(session_id, 'user', user_message)
            
            # 3. 프롬프트 생성 (이전 대화 + 현재 메시지 + 페이지 컨텍스트)
            prompt = f"{history_prompt}User: {user_message}\n"
            if page_context:
                prompt += f"[PageContext: {json.dumps(page_context, ensure_ascii=False)}]\n"
            prompt += "AI: "
            
            # 4. LLM 호출
            response = self.llm.invoke(prompt)
            ai_response = response.content
            
            # 5. AI 응답 저장
            save_message_to_history(session_id, 'ai', ai_response)
            
            # 페이지별 제안사항 생성
            page_suggestions = self._generate_page_suggestions(page_context, user_message)
            
            # DOM 액션 생성 (필요한 경우)
            dom_actions = self._generate_dom_actions(page_context, user_message)
            
            return {
                **state,
                "ai_response": ai_response,
                "context_used": prompt,
                "conversation_history_length": len(history) + 1,
                "page_suggestions": page_suggestions,
                "dom_actions": dom_actions
            }
            
        except Exception as e:
            print(f"Error in chatbot node: {e}")
            return {
                **state,
                "ai_response": "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.",
                "context_used": "",
                "error": str(e),
                "page_suggestions": [],
                "dom_actions": []
            }
    
    def _generate_system_prompt(self, page_context: Dict[str, Any]) -> str:
        """페이지 컨텍스트를 기반으로 시스템 프롬프트 생성"""
        pathname = page_context.get("pathname", "")
        page_prompt = self.page_prompts.get(pathname, "")
        
        if page_prompt:
            return f"{self.base_system_prompt}\n\n{page_prompt}"
        else:
            return self.base_system_prompt
    
    def _format_page_context(self, page_context: Dict[str, Any]) -> str:
        """페이지 컨텍스트를 포맷팅"""
        pathname = page_context.get("pathname", "")
        page_title = page_context.get("pageTitle", "")
        dom_elements = page_context.get("domElements", {})
        
        context_parts = [
            f"현재 페이지: {pathname}",
            f"페이지 제목: {page_title}"
        ]
        
        # DOM 요소 정보 추가
        if dom_elements:
            inputs = dom_elements.get("inputs", [])
            buttons = dom_elements.get("buttons", [])
            
            if inputs:
                input_info = [f"- {input.get('type', 'input')}: {input.get('placeholder', input.get('name', 'unnamed'))}" 
                             for input in inputs[:3]]  # 최대 3개만
                context_parts.append(f"주요 입력 필드:\n" + "\n".join(input_info))
            
            if buttons:
                button_info = [f"- {button.get('text', 'unnamed')}" 
                              for button in buttons[:3]]  # 최대 3개만
                context_parts.append(f"주요 버튼:\n" + "\n".join(button_info))
        
        return "\n".join(context_parts)
    
    def _generate_page_suggestions(self, page_context: Dict[str, Any], user_message: str) -> list:
        """페이지별 제안사항 생성"""
        pathname = page_context.get("pathname", "")
        suggestions = []
        
        # 페이지별 기본 제안사항
        if pathname == "/postrecruitment":
            suggestions.append("채용공고 작성 가이드")
            suggestions.append("자격요건 작성 팁")
        elif pathname == "/applicantlist":
            suggestions.append("지원자 필터링 방법")
            suggestions.append("이력서 검토 체크리스트")
        elif pathname == "/managerschedule":
            suggestions.append("면접 일정 등록")
            suggestions.append("면접관 배정 방법")
        
        return suggestions
    
    def _generate_dom_actions(self, page_context: Dict[str, Any], user_message: str) -> list:
        """DOM 액션 생성"""
        actions = []
        dom_elements = page_context.get("domElements", {})
        inputs = dom_elements.get("inputs", [])
        
        # 사용자 메시지에서 입력 관련 키워드가 있으면 DOM 액션 생성
        input_keywords = ["입력", "작성", "쓰기", "기입", "적기"]
        if any(keyword in user_message for keyword in input_keywords):
            for input_elem in inputs:
                if input_elem.get("placeholder"):
                    actions.append({
                        "action_type": "focus",
                        "selector": f"#{input_elem['id']}" if input_elem.get('id') else f"[name='{input_elem['name']}']",
                        "description": f"{input_elem['placeholder']} 필드에 포커스"
                    })
        
        return actions
    
    def add_knowledge(self, documents: list, metadata: list = None):
        """지식 베이스에 문서 추가"""
        self.rag_system.add_documents(documents, metadata)
    
    def clear_conversation(self, session_id: str):
        """특정 세션의 대화 히스토리 삭제"""
        self.memory.clear_history(session_id)
    
    def update_page_context(self, session_id: str, page_context: Dict[str, Any]):
        """페이지 컨텍스트 업데이트 (향후 확장용)"""
        # 현재는 단순히 로그만 출력
        print(f"Page context updated for session {session_id}: {page_context.get('pathname', 'unknown')}")