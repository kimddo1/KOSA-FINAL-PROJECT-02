import React from 'react';

function InterviewPanel({ questions = [], memo = '', onMemoChange, evaluation = {}, onEvaluationChange }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-100 rounded-3xl shadow p-6 gap-6 min-w-[320px] max-w-[400px]">
      <div>
        <h3 className="text-lg font-bold mb-2">면접 질문 리스트</h3>
        <ul className="space-y-2">
          {questions.length > 0 ? questions.map((q, idx) => (
            <li key={idx} className="border-b pb-1 text-gray-800 text-sm">{q}</li>
          )) : <li className="text-gray-400 text-sm">* 공통질문 ...</li>}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">평가</h3>
        <table className="w-full text-center border">
          <thead>
            <tr>
              <th className="p-1 border">항목</th>
              <th className="p-1 border">상</th>
              <th className="p-1 border">중</th>
              <th className="p-1 border">하</th>
            </tr>
          </thead>
          <tbody>
            {['인성', '역량'].map((item) => (
              <tr key={item}>
                <td className="p-1 border w-1/4">{item}</td>
                {['상', '중', '하'].map((level) => (
                  <td key={level} className="p-1 border">
                    <input
                      type="radio"
                      name={item}
                      value={level}
                      checked={evaluation[item] === level}
                      onChange={() => onEvaluationChange(item, level)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2">면접 메모</h3>
        <textarea
          className="flex-1 border rounded p-2 text-sm resize-none bg-gray-50"
          placeholder="면접 중 메모를 입력하세요..."
          value={memo}
          onChange={e => onMemoChange(e.target.value)}
        />
      </div>
      <div className="text-xs text-gray-500 mt-2">
        + 면접 질문 리스트 자동 채워짐<br/>
        + 면접 메모 바로 가능<br/>
        + 전반적인 평가 메모도 가능
      </div>
    </div>
  );
}

export default InterviewPanel; 