import React from 'react';

function InterviewPanel({ questions = [], memo = '', onMemoChange, evaluation = {}, onEvaluationChange }) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-gray-800 rounded-3xl shadow p-6 gap-6 min-w-[320px] max-w-[400px]">
      <div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">면접 질문 리스트</h3>
        <ul className="space-y-2">
          {questions.length > 0 ? questions.map((q, idx) => (
            <li key={idx} className="border-b border-gray-200 dark:border-gray-600 pb-1 text-gray-800 dark:text-gray-200 text-sm">{q}</li>
          )) : <li className="text-gray-400 dark:text-gray-500 text-sm">* 공통질문 ...</li>}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">평가</h3>
        <table className="w-full text-center border border-gray-300 dark:border-gray-600">
          <thead>
            <tr>
              <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">항목</th>
              <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">상</th>
              <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">중</th>
              <th className="p-1 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">하</th>
            </tr>
          </thead>
          <tbody>
            {['인성', '역량'].map((item) => (
              <tr key={item}>
                <td className="p-1 border border-gray-300 dark:border-gray-600 w-1/4 text-gray-900 dark:text-gray-100">{item}</td>
                {['상', '중', '하'].map((level) => (
                  <td key={level} className="p-1 border border-gray-300 dark:border-gray-600">
                    <input
                      type="radio"
                      name={item}
                      value={level}
                      checked={evaluation[item] === level}
                      onChange={() => onEvaluationChange(item, level)}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">면접 메모</h3>
        <textarea
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm resize-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="면접 중 메모를 입력하세요..."
          value={memo}
          onChange={e => onMemoChange(e.target.value)}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        + 전반적인 평가 메모도 가능
      </div>
    </div>
  );
}

export default InterviewPanel; 