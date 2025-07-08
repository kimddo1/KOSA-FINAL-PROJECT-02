// Mock API for development without backend
class MockApi {
  constructor() {
    this.users = [
      {
        id: 1,
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        name: '관리자',
        company: '테스트 회사'
      },
      {
        id: 2,
        email: 'user@test.com',
        password: 'user123',
        role: 'user',
        name: '일반 사용자',
        company: '테스트 회사'
      },
      {
        id: 3,
        email: 'company@test.com',
        password: 'company123',
        role: 'company',
        name: '기업 사용자',
        company: '테스트 기업'
      }
    ];
    
    this.jobs = [
      {
        id: 1,
        title: '프론트엔드 개발자',
        company: '테스트 기업',
        location: '서울',
        salary: '3000-4000만원',
        description: 'React, Vue.js 경험자 모집',
        requirements: ['JavaScript', 'React', 'Vue.js'],
        status: 'active'
      },
      {
        id: 2,
        title: '백엔드 개발자',
        company: '테스트 기업',
        location: '서울',
        salary: '3500-4500만원',
        description: 'Spring Boot, Node.js 경험자 모집',
        requirements: ['Java', 'Spring Boot', 'Node.js'],
        status: 'active'
      }
    ];

    // 지원자 목록 목업 데이터
    this.applicants = [
      {
        id: 1,
        jobPostId: 1,
        name: '김철수',
        birthDate: '1995-03-15',
        email: 'kim@test.com',
        phone: '010-1234-5678',
        status: 'PASSED',
        isBookmarked: 'N',
        isViewed: false,
        appliedAt: '2024-01-15T09:30:00Z',
        applicationSource: 'DIRECT',
        score: 85
      },
      {
        id: 2,
        jobPostId: 1,
        name: '이영희',
        birthDate: '1993-07-22',
        email: 'lee@test.com',
        phone: '010-2345-6789',
        status: 'PASSED',
        isBookmarked: 'Y',
        isViewed: true,
        appliedAt: '2024-01-14T14:20:00Z',
        applicationSource: 'JOBKOREA',
        score: 92
      },
      {
        id: 3,
        jobPostId: 1,
        name: '박민수',
        birthDate: '1997-11-08',
        email: 'park@test.com',
        phone: '010-3456-7890',
        status: 'WAITING',
        isBookmarked: 'N',
        isViewed: false,
        appliedAt: '2024-01-16T11:15:00Z',
        applicationSource: 'SARAMIN',
        score: 78
      },
      {
        id: 4,
        jobPostId: 1,
        name: '정수진',
        birthDate: '1994-05-12',
        email: 'jung@test.com',
        phone: '010-4567-8901',
        status: 'REJECTED',
        isBookmarked: 'N',
        isViewed: true,
        appliedAt: '2024-01-13T16:45:00Z',
        applicationSource: 'DIRECT',
        score: 65
      },
      {
        id: 5,
        jobPostId: 1,
        name: '최동현',
        birthDate: '1996-09-30',
        email: 'choi@test.com',
        phone: '010-5678-9012',
        status: 'PASSED',
        isBookmarked: 'Y',
        isViewed: true,
        appliedAt: '2024-01-12T10:30:00Z',
        applicationSource: 'JOBKOREA',
        score: 88
      },
      {
        id: 6,
        jobPostId: 1,
        name: '한미영',
        birthDate: '1992-12-03',
        email: 'han@test.com',
        phone: '010-6789-0123',
        status: 'WAITING',
        isBookmarked: 'N',
        isViewed: false,
        appliedAt: '2024-01-17T08:20:00Z',
        applicationSource: 'DIRECT',
        score: 82
      },
      {
        id: 7,
        jobPostId: 1,
        name: '송태호',
        birthDate: '1998-02-18',
        email: 'song@test.com',
        phone: '010-7890-1234',
        status: 'WAITING',
        isBookmarked: 'Y',
        isViewed: true,
        appliedAt: '2024-01-16T15:10:00Z',
        applicationSource: 'SARAMIN',
        score: 79
      },
      {
        id: 8,
        jobPostId: 1,
        name: '윤지은',
        birthDate: '1995-08-25',
        email: 'yoon@test.com',
        phone: '010-8901-2345',
        status: 'PASSED',
        isBookmarked: 'N',
        isViewed: true,
        appliedAt: '2024-01-11T13:40:00Z',
        applicationSource: 'JOBKOREA',
        score: 90
      }
    ];

    // 채용공고 상세 정보
    this.jobPosts = {
      1: {
        id: 1,
        title: '보안SW 개발자 신입/경력사원 모집 (C, C++)',
        company: '테스트 기업',
        department: '소프트웨어 개발팀',
        headcount: 3,
        description: '보안 소프트웨어 개발에 관심 있는 개발자를 모집합니다.',
        requirements: ['C', 'C++', '보안 지식'],
        status: 'ACTIVE'
      }
    };

    // 이력서 상세 정보
    this.resumes = {
      1: {
        id: 1,
        applicantId: 1,
        name: '김철수',
        birthDate: '1995-03-15',
        email: 'kim@test.com',
        phone: '010-1234-5678',
        address: '서울시 강남구',
        education: [
          {
            school: '서울대학교',
            major: '컴퓨터공학과',
            degree: '학사',
            graduationYear: 2020
          }
        ],
        experience: [
          {
            company: '이전 회사',
            position: '주니어 개발자',
            period: '2020-2023',
            description: '웹 애플리케이션 개발'
          }
        ],
        skills: ['C', 'C++', 'Python', 'JavaScript', 'React'],
        certifications: ['정보처리기사', 'SQLD'],
        projects: [
          {
            name: '보안 시스템 개발',
            description: 'C++를 이용한 보안 시스템 개발',
            period: '2022-2023'
          }
        ],
        selfIntroduction: '보안 분야에 깊은 관심을 가지고 있으며, 새로운 기술을 배우는 것을 좋아합니다.'
      },
      2: {
        id: 2,
        applicantId: 2,
        name: '이영희',
        birthDate: '1993-07-22',
        email: 'lee@test.com',
        phone: '010-2345-6789',
        address: '서울시 서초구',
        education: [
          {
            school: '연세대학교',
            major: '소프트웨어공학과',
            degree: '학사',
            graduationYear: 2019
          }
        ],
        experience: [
          {
            company: '대기업',
            position: '시니어 개발자',
            period: '2019-2024',
            description: '대규모 시스템 개발 및 유지보수'
          }
        ],
        skills: ['C', 'C++', 'Java', 'Spring', 'Docker', 'Kubernetes'],
        certifications: ['정보처리기사', 'AWS 솔루션스 아키텍트'],
        projects: [
          {
            name: '클라우드 보안 시스템',
            description: 'AWS 기반 보안 시스템 구축',
            period: '2023-2024'
          }
        ],
        selfIntroduction: '5년간의 개발 경험을 바탕으로 안정적이고 확장 가능한 시스템을 구축할 수 있습니다.'
      },
      5: {
        id: 5,
        applicantId: 5,
        name: '최동현',
        birthDate: '1996-09-30',
        email: 'choi@test.com',
        phone: '010-5678-9012',
        address: '서울시 마포구',
        education: [
          {
            school: '고려대학교',
            major: '전자공학과',
            degree: '학사',
            graduationYear: 2021
          }
        ],
        experience: [
          {
            company: '스타트업',
            position: '풀스택 개발자',
            period: '2021-2024',
            description: '웹 서비스 전반 개발 및 운영'
          }
        ],
        skills: ['C', 'C++', 'JavaScript', 'Node.js', 'React', 'MongoDB'],
        certifications: ['정보처리기사', '네트워크 관리사'],
        projects: [
          {
            name: '실시간 보안 모니터링 시스템',
            description: 'IoT 기반 실시간 보안 모니터링 시스템 개발',
            period: '2023-2024'
          }
        ],
        selfIntroduction: '창의적인 아이디어를 실현하는 것을 좋아하며, 사용자 중심의 서비스를 만드는 것이 목표입니다.'
      },
      8: {
        id: 8,
        applicantId: 8,
        name: '윤지은',
        birthDate: '1995-08-25',
        email: 'yoon@test.com',
        phone: '010-8901-2345',
        address: '서울시 송파구',
        education: [
          {
            school: '한양대학교',
            major: '컴퓨터소프트웨어학부',
            degree: '학사',
            graduationYear: 2020
          }
        ],
        experience: [
          {
            company: '중견기업',
            position: '백엔드 개발자',
            period: '2020-2024',
            description: '서버 사이드 개발 및 API 설계'
          }
        ],
        skills: ['C', 'C++', 'Java', 'Spring Boot', 'MySQL', 'Redis'],
        certifications: ['정보처리기사', 'OCP', 'CCNA'],
        projects: [
          {
            name: '대용량 데이터 처리 시스템',
            description: '하둡 기반 대용량 데이터 처리 시스템 구축',
            period: '2022-2024'
          }
        ],
        selfIntroduction: '안정적이고 효율적인 시스템을 구축하는 것을 전문으로 하며, 팀워크를 중시합니다.'
      }
    };
  }

  // Simulate API delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method interfaces
  async post(url, data) {
    await this.delay();
    
    if (url === '/auth/login') {
      return this.login(data.email, data.password);
    }
    
    if (url === '/jobs') {
      return this.createJob(data);
    }
    
    throw {
      response: {
        status: 404,
        data: { message: 'Mock API: Endpoint not found' }
      }
    };
  }

  async get(url) {
    await this.delay();
    
    if (url === '/auth/me') {
      return this.getMe();
    }
    
    if (url === '/jobs') {
      return this.getJobs();
    }
    
    if (url.startsWith('/jobs/')) {
      const id = url.split('/')[2];
      return this.getJob(id);
    }

    // 지원자 목록 조회
    if (url.startsWith('/applications/job/') && url.endsWith('/applicants')) {
      const jobPostId = url.split('/')[3];
      return this.getApplicantsByJob(jobPostId);
    }

    // 지원서 상세 조회
    if (url.startsWith('/api/v1/applications/')) {
      const parts = url.split('/');
      const applicationIdWithQuery = parts[parts.length - 1];
      let applicationId = applicationIdWithQuery;
      let jobPostId = undefined;
      if (applicationIdWithQuery.includes('?')) {
        const [idPart, queryPart] = applicationIdWithQuery.split('?');
        applicationId = idPart;
        const params = new URLSearchParams(queryPart);
        jobPostId = params.get('jobPostId');
      }
      return this.getApplicationDetail(applicationId, jobPostId);
    }

    // 채용공고 상세 조회
    if (url.startsWith('/company/jobposts/')) {
      const jobPostId = url.split('/')[3];
      return this.getJobPostDetail(jobPostId);
    }
    
    throw {
      response: {
        status: 404,
        data: { message: 'Mock API: Endpoint not found' }
      }
    };
  }

  async patch(url, data) {
    await this.delay();
    
    // 즐겨찾기 토글
    if (url.startsWith('/api/v1/applications/') && url.endsWith('/bookmark')) {
      const applicationId = url.split('/')[3];
      return this.toggleBookmark(applicationId, data.isBookmarked);
    }
    
    throw {
      response: {
        status: 404,
        data: { message: 'Mock API: Endpoint not found' }
      }
    };
  }

  async put(url, data) {
    await this.delay();
    
    if (url.startsWith('/jobs/')) {
      const id = url.split('/')[2];
      return this.updateJob(id, data);
    }
    
    throw {
      response: {
        status: 404,
        data: { message: 'Mock API: Endpoint not found' }
      }
    };
  }

  async delete(url) {
    await this.delay();
    
    if (url.startsWith('/jobs/')) {
      const id = url.split('/')[2];
      return this.deleteJob(id);
    }

    // 지원자 삭제
    if (url.startsWith('/applications/')) {
      const applicationId = url.split('/')[2];
      return this.deleteApplication(applicationId);
    }
    
    throw {
      response: {
        status: 404,
        data: { message: 'Mock API: Endpoint not found' }
      }
    };
  }

  // Mock login
  async login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return {
        data: {
          access_token: `mock_token_${user.id}`,
          user: userWithoutPassword
        }
      };
    } else {
      throw {
        response: {
          status: 401,
          data: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
        }
      };
    }
  }

  // Mock get user info
  async getMe() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw {
        response: {
          status: 401,
          data: { message: '인증이 필요합니다.' }
        }
      };
    }

    const userId = token.split('_')[2];
    const user = this.users.find(u => u.id == userId);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return { data: userWithoutPassword };
    } else {
      throw {
        response: {
          status: 401,
          data: { message: '사용자를 찾을 수 없습니다.' }
        }
      };
    }
  }

  // Mock get jobs
  async getJobs() {
    return { data: this.jobs };
  }

  // Mock get job by id
  async getJob(id) {
    const job = this.jobs.find(j => j.id == id);
    
    if (job) {
      return { data: job };
    } else {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }
  }

  // 지원자 목록 조회
  async getApplicantsByJob(jobPostId) {
    return { data: this.applicants };
  }

  // 지원서 상세 조회
  async getApplicationDetail(applicationId, jobPostId) {
    let applicant;
    if (jobPostId) {
      applicant = this.applicants.find(a => a.id == applicationId && String(a.jobPostId) === String(jobPostId));
    } else {
      applicant = this.applicants.find(a => a.id == applicationId);
    }
    if (!applicant) {
      throw {
        response: {
          status: 404,
          data: { message: '지원자를 찾을 수 없습니다.' }
        }
      };
    }
    const resume = this.resumes[applicationId] || this.resumes[1];
    return { data: { ...applicant, ...resume } };
  }

  // 채용공고 상세 조회
  async getJobPostDetail(jobPostId) {
    const jobPost = this.jobPosts[jobPostId];
    if (!jobPost) {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }
    return { data: jobPost };
  }

  // 즐겨찾기 토글
  async toggleBookmark(applicationId, isBookmarked) {
    const applicant = this.applicants.find(a => a.id == applicationId);
    if (!applicant) {
      throw {
        response: {
          status: 404,
          data: { message: '지원자를 찾을 수 없습니다.' }
        }
      };
    }

    applicant.isBookmarked = isBookmarked;
    return { data: { success: true } };
  }

  // 지원자 삭제
  async deleteApplication(applicationId) {
    const index = this.applicants.findIndex(a => a.id == applicationId);
    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: { message: '지원자를 찾을 수 없습니다.' }
        }
      };
    }

    this.applicants.splice(index, 1);
    return { data: { success: true } };
  }

  async createJob(jobData) {
    const newJob = {
      id: this.jobs.length + 1,
      ...jobData,
      status: 'active'
    };
    this.jobs.push(newJob);
    return { data: newJob };
  }

  async updateJob(id, jobData) {
    const jobIndex = this.jobs.findIndex(j => j.id == id);
    
    if (jobIndex === -1) {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }

    this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...jobData };
    return { data: this.jobs[jobIndex] };
  }

  async deleteJob(id) {
    const jobIndex = this.jobs.findIndex(j => j.id == id);
    
    if (jobIndex === -1) {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }

    this.jobs.splice(jobIndex, 1);
    return { data: { success: true } };
  }
}

// Create singleton instance
const mockApi = new MockApi();

export default mockApi;
