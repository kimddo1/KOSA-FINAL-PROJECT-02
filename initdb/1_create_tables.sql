USE kocruit;

CREATE TABLE company (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    address VARCHAR(255),
    phone   VARCHAR(20),
    website VARCHAR(255),
    bus_num VARCHAR(50) UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    address     VARCHAR(255),
    gender      VARCHAR(10),
    phone       VARCHAR(20),
    role        VARCHAR(20) DEFAULT 'USER',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    birth_date  DATE,
    user_type   VARCHAR(20)
);
 

CREATE TABLE resume (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    title       VARCHAR(255) NOT NULL,
    content     TEXT,
    file_url    VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
 


CREATE TABLE spec (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    resume_id        INT NOT NULL,
    spec_type        VARCHAR(255) NOT NULL,
    spec_title       VARCHAR(255) NOT NULL,
    spec_description TEXT,

    FOREIGN KEY (resume_id) REFERENCES resume(id)
);
 


CREATE TABLE department (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    job_function VARCHAR(255),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    company_id   INT,
    FOREIGN KEY (company_id) REFERENCES company(id)
);

CREATE TABLE jobpost (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    company_id     INT,
    department_id  INT,
    user_id        INT,
    title          VARCHAR(200) NOT NULL,
    department     VARCHAR(100),
    qualifications TEXT,
    conditions     TEXT,
    job_details     TEXT,
    procedures     TEXT,
    headcount      INT,
    start_date      VARCHAR(50),
    end_date        VARCHAR(50),
    location       VARCHAR(255),
    employment_type VARCHAR(50),
    deadline       VARCHAR(50),
    team_members    TEXT,
    weights        TEXT,
    status         VARCHAR(20) DEFAULT 'ACTIVE',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (department_id) REFERENCES department(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

 
CREATE TABLE company_user (
    id            INT PRIMARY KEY,
    company_id    INT,
    bus_num       VARCHAR(50),
    department_id INT,
    ranks         VARCHAR(50),
    joined_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);



CREATE TABLE schedule (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    schedule_type  VARCHAR(255),
    user_id        INT,
    title          VARCHAR(255),
    description    TEXT,
    location       VARCHAR(255),
    scheduled_at   TIMESTAMP,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status         VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES company_user(id)
);


CREATE TABLE applicant_user (
    id               INT PRIMARY KEY,
    resume_file_path VARCHAR(255),

    FOREIGN KEY (id) REFERENCES users(id)
);




CREATE TABLE application (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    resume_id          INT,
    job_post_id     INT NOT NULL,
    score              DECIMAL(10,2),
    ai_score           DECIMAL(5,2),
    human_score        DECIMAL(5,2),
    final_score        DECIMAL(5,2),
    status             VARCHAR(20),
    applied_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_source VARCHAR(255),
    pass_reason        TEXT,
    fail_reason        TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resume_id) REFERENCES resume(id),
    FOREIGN KEY (job_post_id) REFERENCES jobpost(id),
    CHECK (status IN ('WAITING', 'PASSED', 'REJECTED'))
);
 


CREATE TABLE field_name_score (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    application_id  INT NOT NULL,
    field_name      VARCHAR(255) NOT NULL,
    score           DECIMAL(10,2),

    FOREIGN KEY (application_id) REFERENCES application(id)
);
 



CREATE TABLE jobpost_role (
    jobpost_id       INT NOT NULL,
    company_user_id  INT NOT NULL,
    role             VARCHAR(30) NOT NULL,
    granted_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (jobpost_id, company_user_id, role),
    FOREIGN KEY (jobpost_id)      REFERENCES jobpost(id)      ON DELETE CASCADE,
    FOREIGN KEY (company_user_id) REFERENCES company_user(id) ON DELETE CASCADE,
    
    CHECK (role IN ('MANAGER', 'MEMBER'))
);


CREATE TABLE weight (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    target_type   VARCHAR(255) NOT NULL,
    jobpost_id    INT,
    field_name    VARCHAR(255) NOT NULL,
    weight_value  FLOAT,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (jobpost_id) REFERENCES jobpost(id)
);



CREATE TABLE schedule_interview (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id    INT,
    user_id        INT,
    schedule_date  TIMESTAMP,
    status         VARCHAR(255),

    FOREIGN KEY (schedule_id) REFERENCES schedule(id),
    FOREIGN KEY (user_id) REFERENCES company_user(id)
);
 


CREATE TABLE notification (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    message     TEXT,
    user_id     INT,
    type        VARCHAR(255),
    is_read     TINYINT(1) DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);



CREATE TABLE resume_memo (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT,
    application_id  INT,
    content         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES company_user(id),
    FOREIGN KEY (application_id) REFERENCES application(id)
);


CREATE TABLE interview_evaluation (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    interview_id   INT NOT NULL,
    evaluator_id   INT,
    is_ai          TINYINT(1) DEFAULT 0 CHECK (is_ai IN (0, 1)),
    score          DECIMAL(5,2),
    summary        TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (interview_id) REFERENCES schedule_interview(id),
    FOREIGN KEY (evaluator_id) REFERENCES company_user(id)
);
 



CREATE TABLE evaluation_detail (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    category      VARCHAR(100),
    grade         VARCHAR(10),
    score         DECIMAL(5,2),

    FOREIGN KEY (evaluation_id) REFERENCES interview_evaluation(id)
);
 


CREATE TABLE interview_question (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    type           VARCHAR(20),
    question_text  VARCHAR(1000),

    FOREIGN KEY (application_id) REFERENCES application(id)
);

CREATE TABLE email_verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);