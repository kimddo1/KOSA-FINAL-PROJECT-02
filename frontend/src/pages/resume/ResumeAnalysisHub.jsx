import React, { useState } from 'react';
import api from '../../api/api';
import ResumeAnalysisToolbar from '../../components/ResumeAnalysisToolbar';

export default function ResumeAnalysisHub({ resumeId, applicationId, onApplicantSelect }) {
  const [toolbarResults, setToolbarResults] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);

  // resumeId가 바뀌면 상태 초기화
  React.useEffect(() => {
    setToolbarResults({});
    setSelectedTool(null);
  }, [resumeId]);

  // applicationId가 바뀌면 선택 상태만 초기화 (저장된 결과는 유지)
  React.useEffect(() => {
    setSelectedTool(null);
  }, [applicationId]);

  // 툴바에서 분석 결과를 받는 핸들러
  const handleToolbarAnalysisResult = (toolId, result) => {
    setToolbarResults(prev => ({
      ...prev,
      [toolId]: result
    }));
    setSelectedTool(toolId);
  };

  // 도구 변경 시 처리
  const handleToolChange = (toolId) => {
    setSelectedTool(toolId);
  };

  // 분석 도구별 제목 매핑
  const getAnalysisTitle = (toolId) => {
    switch(toolId) {
      case 'comprehensive': return '이력서 종합분석 결과';
      case 'detailed': return '이력서 상세분석 결과';
      case 'applicant_comparison': return '같은 공고 지원자 비교분석 결과';
      case 'impact_points': return '이력서 임팩트 포인트';
      case 'keyword_matching': return '이력서 키워드 매칭 결과';
      default: return '이력서 분석 결과';
    }
  };

  // 원형 프로그레스 바 컴포넌트
  const CircularProgress = ({ value, size = 60, strokeWidth = 6, label, color = "#3B82F6", maxValue = 100 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (value / maxValue) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg height={size} width={size} className="transform -rotate-90">
            <circle
              stroke="#E5E7EB"
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeWidth={strokeWidth}
            />
            <circle
              stroke={color}
              fill="transparent"
              r={radius}
              cx={size / 2}
              cy={size / 2}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{value}</span>
          </div>
        </div>
        <span className="text-xs mt-1 text-gray-600">{label}</span>
      </div>
    );
  };

  // 종합분석 결과 렌더링
  const renderComprehensiveAnalysis = (analysis) => {
    // 실제 AI 분석 결과 활용 - comprehensive_analysis_tool.py 응답 구조에 맞게 수정
    // analysis가 직접 결과이거나, results.comprehensive에 있을 수 있음
    const analysisData = analysis?.results?.comprehensive || analysis;
    
    if (!analysisData || typeof analysisData !== 'object') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">AI가 이력서를 종합 분석 중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">잠시만 기다려주세요. 고도의 분석이 진행되고 있습니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 이력서 요약 */}
        {analysisData.resume_summary && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 이력서 요약</h4>
            <p className="text-gray-700">{analysisData.resume_summary}</p>
          </div>
        )}

        {/* 직무 적합성 점수 */}
        {typeof analysisData.job_matching_score === 'number' && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🎯 직무 적합성</h4>
            <div className="flex items-center space-x-4">
              <CircularProgress 
                value={Math.round(analysisData.job_matching_score * 100)}
                size={80}
                strokeWidth={8}
                label={`${Math.round(analysisData.job_matching_score * 100)}점`}
                color="#10B981"
                maxValue={100}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  해당 직무에 대한 종합적인 적합성을 나타냅니다.
                </p>
                {analysisData.job_matching_details && (
                  <p className="text-xs text-gray-500 mt-1">{analysisData.job_matching_details}</p>
                )}
                <div className="mt-2 p-2 bg-white rounded border">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1">📊 평가 기준</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    <li>• 기술 스택 매칭 (30%): 요구 기술과 보유 기술 일치도</li>
                    <li>• 경험 관련성 (25%): 직무와 관련된 경험의 적합성</li>
                    <li>• 자격 요건 매칭 (20%): 요구 자격증 및 학력 조건</li>
                    <li>• 키워드 매칭 (15%): 공고 키워드와 이력서 내용 일치</li>
                    <li>• 배경 적합성 (10%): 전반적인 배경과 직무의 부합성</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 주요 프로젝트 */}
        {analysisData.key_projects && analysisData.key_projects.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">🚀 주요 프로젝트</h4>
            <ul className="space-y-2">
              {analysisData.key_projects.map((project, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{project}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 기술 스택과 소프트 스킬 */}
        <div className="grid grid-cols-2 gap-4">
          {analysisData.technical_skills && analysisData.technical_skills.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">💻 기술 스택</h4>
              <div className="flex flex-wrap gap-2">
                {analysisData.technical_skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysisData.soft_skills && analysisData.soft_skills.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">🤝 소프트 스킬</h4>
              <div className="flex flex-wrap gap-2">
                {analysisData.soft_skills.map((skill, index) => (
                  <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 경험 하이라이트와 우려사항 */}
        <div className="grid grid-cols-2 gap-4">
          {analysisData.experience_highlights && analysisData.experience_highlights.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">⭐ 경험 하이라이트</h4>
              <ul className="space-y-2">
                {analysisData.experience_highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysisData.potential_concerns && analysisData.potential_concerns.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-3">⚠️ 잠재적 우려사항</h4>
              <ul className="space-y-2">
                {analysisData.potential_concerns.map((concern, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 면접 집중 영역 */}
        {analysisData.interview_focus_areas && analysisData.interview_focus_areas.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-3">🎤 면접 집중 영역</h4>
            <ul className="space-y-2">
              {analysisData.interview_focus_areas.map((area, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 포트폴리오 분석 */}
        {analysisData.portfolio_analysis && analysisData.portfolio_analysis !== "포트폴리오 정보가 없습니다." && (
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-2">🎨 포트폴리오 분석</h4>
            <p className="text-gray-700">{analysisData.portfolio_analysis}</p>
          </div>
        )}

        {/* 분석 결과가 비어있는 경우 AI 분석 중 메시지 */}
        {(!analysisData.resume_summary && typeof analysisData.job_matching_score !== 'number' && (!analysisData.key_projects || analysisData.key_projects.length === 0)) && (
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800 font-medium">AI가 이력서를 분석 중입니다...</p>
            <p className="text-blue-600 text-sm mt-2">잠시만 기다려주세요. 고도의 분석이 진행되고 있습니다.</p>
          </div>
        )}
      </div>
    );
  };

  // 상세분석 결과 렌더링
  const renderDetailedAnalysis = (result) => {
    // 실제 AI 분석 결과 활용
    const analysisData = result?.results?.detailed || result;
    
    if (!analysisData || typeof analysisData !== 'object') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">AI가 상세 분석을 수행 중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">심도 있는 역량 분석이 진행되고 있습니다.</p>
        </div>
      );
    }

    const { 
      core_competencies, 
      experience_analysis, 
      growth_potential, 
      problem_solving, 
      leadership_collaboration, 
      specialization, 
      improvement_areas, 
      overall_assessment 
    } = analysisData;

    return (
      <div className="space-y-6">
        {/* 전체 평가 */}
        {overall_assessment && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4">🎯 종합 평가</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                {overall_assessment.job_fit_score && (
                  <CircularProgress 
                    value={overall_assessment.job_fit_score}
                    size={100}
                    strokeWidth={10}
                    label={`${overall_assessment.job_fit_score}점`}
                    color="#8B5CF6"
                    maxValue={100}
                  />
                )}
                <p className="text-sm text-gray-600 mt-2">직무 적합성</p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <h5 className="text-xs font-semibold text-gray-600 mb-1">📊 AI 평가 기준</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    <li>• 학력 (20점): 대학/전공/성적</li>
                    <li>• 경험 (25점): 관련 업계 경력</li>
                    <li>• 기술 (25점): 기술 스택 보유도</li>
                    <li>• 자격증 (15점): 관련 자격증</li>
                    <li>• 수상/프로젝트 (25점): 성과 및 경험</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                {overall_assessment.overall_rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">등급:</span>
                    <span className="font-bold text-purple-600">{overall_assessment.overall_rating}</span>
                  </div>
                )}
                {overall_assessment.hiring_recommendation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">추천:</span>
                    <span className={`font-bold ${
                      overall_assessment.hiring_recommendation === '추천' ? 'text-green-600' :
                      overall_assessment.hiring_recommendation === '보류' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {overall_assessment.hiring_recommendation}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {overall_assessment.key_reasons && overall_assessment.key_reasons.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">주요 근거:</p>
                <div className="flex flex-wrap gap-2">
                  {overall_assessment.key_reasons.map((reason, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 핵심 역량 */}
        {core_competencies && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-4">💪 핵심 역량</h4>
            <div className="grid grid-cols-2 gap-4">
              {core_competencies.technical_skills && core_competencies.technical_skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">기술적 역량</h5>
                  <ul className="space-y-1">
                    {core_competencies.technical_skills.map((skill, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {core_competencies.soft_skills && core_competencies.soft_skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">소프트 스킬</h5>
                  <ul className="space-y-1">
                    {core_competencies.soft_skills.map((skill, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {core_competencies.expertise_level && (
              <div className="mt-4 text-center">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  전문성 수준: {core_competencies.expertise_level}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 경험 분석 */}
        {experience_analysis && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4">📊 경험 분석</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {experience_analysis.depth_score && (
                <div className="text-center">
                  <CircularProgress 
                    value={experience_analysis.depth_score}
                    size={60}
                    strokeWidth={6}
                    label={`${experience_analysis.depth_score}`}
                    color="#3B82F6"
                    maxValue={100}
                  />
                  <p className="text-xs mt-1 text-gray-600">깊이</p>
                </div>
              )}
              {experience_analysis.breadth_score && (
                <div className="text-center">
                  <CircularProgress 
                    value={experience_analysis.breadth_score}
                    size={60}
                    strokeWidth={6}
                    label={`${experience_analysis.breadth_score}`}
                    color="#10B981"
                    maxValue={100}
                  />
                  <p className="text-xs mt-1 text-gray-600">폭</p>
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 text-lg">⭐</span>
                </div>
                <p className="text-xs mt-1 text-gray-600">품질</p>
              </div>
            </div>
            {experience_analysis.quality_assessment && (
              <p className="text-sm text-gray-700 text-center">{experience_analysis.quality_assessment}</p>
            )}
            {experience_analysis.standout_experiences && experience_analysis.standout_experiences.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium text-gray-700 mb-2">특별한 경험</h5>
                <div className="flex flex-wrap gap-2">
                  {experience_analysis.standout_experiences.map((exp, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 성장 잠재력 */}
        {growth_potential && (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-4">🚀 성장 잠재력</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {growth_potential.learning_ability && (
                <div className="text-center">
                  <CircularProgress 
                    value={growth_potential.learning_ability}
                    size={60}
                    strokeWidth={6}
                    label={`${growth_potential.learning_ability}`}
                    color="#8B5CF6"
                    maxValue={100}
                  />
                  <p className="text-xs mt-1 text-gray-600">학습능력</p>
                </div>
              )}
              {growth_potential.adaptability && (
                <div className="text-center">
                  <CircularProgress 
                    value={growth_potential.adaptability}
                    size={60}
                    strokeWidth={6}
                    label={`${growth_potential.adaptability}`}
                    color="#F59E0B"
                    maxValue={100}
                  />
                  <p className="text-xs mt-1 text-gray-600">적응력</p>
                </div>
              )}
              {growth_potential.innovation_capacity && (
                <div className="text-center">
                  <CircularProgress 
                    value={growth_potential.innovation_capacity}
                    size={60}
                    strokeWidth={6}
                    label={`${growth_potential.innovation_capacity}`}
                    color="#EF4444"
                    maxValue={100}
                  />
                  <p className="text-xs mt-1 text-gray-600">혁신성</p>
                </div>
              )}
            </div>
            {growth_potential.assessment && (
              <p className="text-sm text-gray-700 text-center">{growth_potential.assessment}</p>
            )}
          </div>
        )}

        {/* 개선 영역 */}
        {improvement_areas && (
          <div className="bg-orange-50 p-6 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-4">📈 개선 영역</h4>
            <div className="grid grid-cols-2 gap-4">
              {improvement_areas.weaknesses && improvement_areas.weaknesses.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">약점</h5>
                  <ul className="space-y-1">
                    {improvement_areas.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {improvement_areas.recommendations && improvement_areas.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">개선 제안</h5>
                  <ul className="space-y-1">
                    {improvement_areas.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 등급 정규화 함수
  const normalizeGrade = (gradeText) => {
    if (!gradeText || gradeText === 'N/A') return 'N/A';
    
    // A+, A, A-, B+, B, B-, C+, C, C- 패턴에서 첫 번째만 추출
    const gradePattern = /[ABC][+-]?/;
    const match = gradeText.toString().match(gradePattern);
    
    return match ? match[0] : 'N/A';
  };

  // 지원자 클릭 핸들러
  const handleApplicantClick = (applicant) => {
    if (applicant.application_id && onApplicantSelect) {
      onApplicantSelect(applicant.application_id, applicant);
    }
  };

  // 지원자 비교 분석 결과 렌더링
  const renderApplicantComparisonAnalysis = (result) => {
    // 실제 AI 분석 결과 활용
    const analysisData = result?.results?.applicant_comparison || result;
    
    if (!analysisData || typeof analysisData !== 'object') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">AI가 지원자들을 비교 분석 중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">같은 공고에 지원한 다른 지원자들과 비교하고 있습니다.</p>
        </div>
      );
    }

    const { 
      competition_analysis, 
      comparative_strengths, 
      comparative_weaknesses, 
      differentiation_points,
      competitive_strategy,
      hiring_probability,
      other_applicants_summary 
    } = analysisData;

    return (
      <div className="space-y-6">
        {/* 경쟁 분석 요약 */}
        {competition_analysis && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-4">🏆 해당 공고 내 경쟁력 분석</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {normalizeGrade(competition_analysis.competitiveness_grade)}
                </div>
                <p className="text-sm text-gray-600">등급</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {competition_analysis.estimated_ranking || 'N/A'}
                </div>
                <p className="text-sm text-gray-600">예상 순위</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                총 {competition_analysis.total_applicants_analyzed || 0}명 분석
              </span>
            </div>
            {competition_analysis.rank_explanation && (
              <p className="text-sm text-gray-700 mt-4 text-center">
                {competition_analysis.rank_explanation}
              </p>
            )}
          </div>
        )}

        {/* 비교 강점과 약점 */}
        <div className="grid grid-cols-2 gap-4">
          {comparative_strengths && comparative_strengths.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">💪 다른 지원자 대비 강점</h4>
              <ul className="space-y-2">
                {comparative_strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comparative_weaknesses && comparative_weaknesses.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-3">⚠️ 다른 지원자 대비 약점</h4>
              <ul className="space-y-2">
                {comparative_weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 차별화 포인트 */}
        {differentiation_points && differentiation_points.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-3">⭐ 차별화 포인트</h4>
            <div className="grid grid-cols-1 gap-2">
              {differentiation_points.map((point, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 경쟁 전략 */}
        {competitive_strategy && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-3">🎯 경쟁 전략</h4>
            <div className="space-y-3">
              {competitive_strategy.positioning && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">포지셔닝</h5>
                  <p className="text-sm text-gray-600">{competitive_strategy.positioning}</p>
                </div>
              )}
              {competitive_strategy.appeal_points && competitive_strategy.appeal_points.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">어필 포인트</h5>
                  <div className="flex flex-wrap gap-2">
                    {competitive_strategy.appeal_points.map((point, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {competitive_strategy.unique_value && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">고유 가치</h5>
                  <p className="text-sm text-gray-600">{competitive_strategy.unique_value}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 채용 가능성 */}
        {hiring_probability && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-3">📈 채용 가능성 예측</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {hiring_probability.success_rate || 'N/A'}
                </div>
                <p className="text-xs text-gray-600">성공률</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">
                  {hiring_probability.key_factors ? hiring_probability.key_factors.length : 0}개
                </div>
                <p className="text-xs text-gray-600">성공 요인</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-red-600">
                  {hiring_probability.risk_factors ? hiring_probability.risk_factors.length : 0}개
                </div>
                <p className="text-xs text-gray-600">위험 요인</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {hiring_probability.key_factors && hiring_probability.key_factors.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">성공 요인</h5>
                  <ul className="space-y-1">
                    {hiring_probability.key_factors.map((factor, index) => (
                      <li key={index} className="text-xs text-green-700 flex items-start">
                        <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hiring_probability.risk_factors && hiring_probability.risk_factors.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">위험 요인</h5>
                  <ul className="space-y-1">
                    {hiring_probability.risk_factors.map((factor, index) => (
                      <li key={index} className="text-xs text-red-700 flex items-start">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 다른 지원자들 카드 */}
        {other_applicants_summary && other_applicants_summary.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">👥 같은 공고의 다른 지원자들</h4>
            <p className="text-sm text-gray-600 mb-4">💡 지원자를 클릭하면 해당 지원자의 이력서 분석으로 이동합니다</p>

            <div className="grid grid-cols-1 gap-3">
              {other_applicants_summary.map((applicant, index) => (
                <div 
                  key={index} 
                  className={`bg-white p-4 rounded-lg shadow-sm border transition-all duration-200 ${
                    applicant.application_id 
                      ? 'hover:shadow-md hover:border-blue-300 cursor-pointer hover:bg-blue-50' 
                      : 'opacity-75 cursor-not-allowed bg-gray-50'
                  }`}
                  onClick={() => applicant.application_id && handleApplicantClick(applicant)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-800">{applicant.name || `지원자 ${index + 1}`}</h5>
                      <p className="text-sm text-gray-600">{applicant.education} | {applicant.major}</p>
                      {!applicant.application_id && (
                        <p className="text-xs text-red-500 mt-1">⚠️ 클릭 불가능 (상세 정보 없음)</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      applicant.competitive_threat === '높음' ? 'bg-red-100 text-red-700' :
                      applicant.competitive_threat === '보통' ? 'bg-yellow-100 text-yellow-700' :
                      applicant.competitive_threat === '낮음' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      위협도: {applicant.competitive_threat || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {applicant.strengths && applicant.strengths.length > 0 && (
                      <div>
                        <h6 className="text-xs font-medium text-green-700 mb-1">강점</h6>
                        <ul className="space-y-1">
                          {applicant.strengths.slice(0, 2).map((strength, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <span className="w-1 h-1 bg-green-400 rounded-full mt-1.5 mr-1 flex-shrink-0"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {applicant.weaknesses && applicant.weaknesses.length > 0 && (
                      <div>
                        <h6 className="text-xs font-medium text-orange-700 mb-1">약점</h6>
                        <ul className="space-y-1">
                          {applicant.weaknesses.slice(0, 2).map((weakness, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start">
                              <span className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 mr-1 flex-shrink-0"></span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 임팩트 포인트 결과 렌더링
  const renderImpactPointsAnalysis = (result) => {
    // 실제 AI 분석 결과 활용
    const analysisData = result?.results?.impact_points || result;
    
    if (!analysisData || typeof analysisData !== 'object') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">AI가 임팩트 포인트를 분석 중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">후보의 핵심 포인트를 추출하고 있습니다.</p>
        </div>
      );
    }

    const { strengths, cautions, interview_points, additional_insights } = analysisData;

    return (
      <div className="space-y-6">
        {/* 후보 임팩트 포인트 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-4 flex items-center">
            <span className="text-xl mr-2">⭐</span>
            후보 임팩트 포인트
          </h4>
          <p className="text-sm text-gray-600 mb-4">이력서 기반 핵심 요약</p>
        </div>

        {/* 강점 Top3 */}
        {strengths && strengths.length > 0 && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center">
              <span className="text-xl mr-2">🤝</span>
              강점 Top3
            </h4>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 주의사항 Top2 */}
        {cautions && cautions.length > 0 && (
          <div className="bg-orange-50 p-6 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-4 flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              주의사항 Top2
            </h4>
            <ul className="space-y-3">
              {cautions.map((caution, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{caution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 면접 포인트 Top2 */}
        {interview_points && interview_points.length > 0 && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
              <span className="text-xl mr-2">🎤</span>
              면접 포인트 Top2
            </h4>
            <ul className="space-y-3">
              {interview_points.map((point, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 추가 인사이트 */}
        {additional_insights && (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              추가 인사이트
            </h4>
            <p className="text-sm text-gray-700">{additional_insights}</p>
          </div>
        )}
      </div>
    );
  };

  // 키워드 매칭 결과 렌더링
  const renderKeywordMatchingAnalysis = (result) => {
    // 실제 AI 분석 결과 활용
    const analysisData = result?.results?.keyword_matching || result;
    
    if (!analysisData || typeof analysisData !== 'object') {
      return (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">AI가 키워드 매칭을 분석 중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">직무 요구사항과의 매칭도를 계산하고 있습니다.</p>
        </div>
      );
    }

    const { matching_summary, matched_keywords, missing_keywords, skill_gap_analysis } = analysisData;

    return (
      <div className="space-y-6">
        {/* 매칭 요약 */}
        {matching_summary && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4">🔗 직무 요구사항 매칭도</h4>
            <div className="text-center mb-4">
              {matching_summary.overall_match_score && (
                <CircularProgress 
                  value={matching_summary.overall_match_score / 10}
                  size={120}
                  strokeWidth={12}
                  label={`${matching_summary.overall_match_score}%`}
                  color="#3B82F6"
                />
              )}
            </div>
            {matching_summary.summary && (
              <p className="text-sm text-gray-700 text-center">{matching_summary.summary}</p>
            )}
          </div>
        )}

        {/* 매칭된 키워드 */}
        {matched_keywords && matched_keywords.length > 0 && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-4">✅ 매칭된 키워드</h4>
            <div className="grid grid-cols-1 gap-3">
              {matched_keywords.map((keyword, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      <span className="font-medium text-gray-800">{keyword.keyword || keyword}</span>
                    </div>
                    {keyword.relevance && (
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{width: `${keyword.relevance}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-600">{keyword.relevance}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 부족한 키워드 */}
        {missing_keywords && missing_keywords.length > 0 && (
          <div className="bg-orange-50 p-6 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-4">⚠️ 부족한 키워드</h4>
            <div className="grid grid-cols-1 gap-3">
              {missing_keywords.map((keyword, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                    <span className="text-gray-700">{keyword.keyword || keyword}</span>
                    {keyword.importance && (
                      <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        중요도: {keyword.importance}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 스킬 갭 분석 */}
        {skill_gap_analysis && (
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-4">💡 스킬 갭 분석</h4>
            <div className="space-y-3">
              {skill_gap_analysis.recommendations && skill_gap_analysis.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">개선 제안</h5>
                  <ul className="space-y-2">
                    {skill_gap_analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {skill_gap_analysis.priority_skills && skill_gap_analysis.priority_skills.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">우선 학습 스킬</h5>
                  <div className="flex flex-wrap gap-2">
                    {skill_gap_analysis.priority_skills.map((skill, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 분석 결과 렌더링
  const renderAnalysisResult = (toolId, result) => {
    switch(toolId) {
      case 'comprehensive':
        return renderComprehensiveAnalysis(result);
      case 'detailed':
        return renderDetailedAnalysis(result);
      case 'applicant_comparison':
        return renderApplicantComparisonAnalysis(result);
      case 'impact_points':
        return renderImpactPointsAnalysis(result);
      case 'keyword_matching':
        return renderKeywordMatchingAnalysis(result);
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 상단: 모든 분석 도구들 */}
      <ResumeAnalysisToolbar 
        resumeId={resumeId} 
        applicationId={applicationId}
        onAnalysisResult={handleToolbarAnalysisResult}
        onToolChange={handleToolChange}
      />
      
      {/* 선택된 분석 결과 표시 */}
      {selectedTool && toolbarResults[selectedTool] ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getAnalysisTitle(selectedTool)}
          </h3>
          {renderAnalysisResult(selectedTool, toolbarResults[selectedTool])}
        </div>
      ) : selectedTool && !toolbarResults[selectedTool] ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800 font-medium">AI가 분석을 수행 중입니다...</p>
            <p className="text-blue-600 text-sm mt-2">잠시만 기다려주세요.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
} 