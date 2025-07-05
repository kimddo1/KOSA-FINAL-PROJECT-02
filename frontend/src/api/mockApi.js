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

  // Mock create job
  async createJob(jobData) {
    const newJob = {
      id: this.jobs.length + 1,
      ...jobData,
      status: 'active'
    };
    this.jobs.push(newJob);
    return { data: newJob };
  }

  // Mock update job
  async updateJob(id, jobData) {
    const jobIndex = this.jobs.findIndex(j => j.id == id);
    
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...jobData };
      return { data: this.jobs[jobIndex] };
    } else {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }
  }

  // Mock delete job
  async deleteJob(id) {
    const jobIndex = this.jobs.findIndex(j => j.id == id);
    
    if (jobIndex !== -1) {
      this.jobs.splice(jobIndex, 1);
      return { data: { message: '삭제되었습니다.' } };
    } else {
      throw {
        response: {
          status: 404,
          data: { message: '채용공고를 찾을 수 없습니다.' }
        }
      };
    }
  }
}

export default new MockApi(); 