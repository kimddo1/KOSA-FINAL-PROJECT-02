import pymysql
import json
from datetime import datetime

print("🚀 Starting seed data insertion...")

def parse_datetime(value):
    try:
        return datetime.fromisoformat(value)
    except:
        return None

# DB 연결
# conn = mysql.connector.connect(
#     host="localhost",  # 호스트에서 실행
#     user="root",
#     password="root",  # docker-compose.yml의 MYSQL_ROOT_PASSWORD
#     database="kocruit_db",
#     port=3307  # docker-compose.yml의 포트 매핑
# )


conn = pymysql.connect(
    host="kocruit-01.c5k2wi2q8g80.us-east-2.rds.amazonaws.com",
    user="admin",
    password="kocruit1234!",
    db="kocruit"
)
cursor = conn.cursor()
print("✅ Database connection successful!")

# # 기존 데이터 삭제 (순서 중요: 외래키 제약조건 때문에)
# cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
# cursor.execute("DELETE FROM schedule_interview")
# cursor.execute("DELETE FROM interview_evaluation")
# cursor.execute("DELETE FROM interview_question")
# cursor.execute("DELETE FROM evaluation_detail")
# cursor.execute("DELETE FROM application")
# cursor.execute("DELETE FROM applicant_user")
# cursor.execute("DELETE FROM company_user")
# cursor.execute("DELETE FROM resume_memo")
# cursor.execute("DELETE FROM spec")
# cursor.execute("DELETE FROM resume")
# cursor.execute("DELETE FROM jobpost_role")
# cursor.execute("DELETE FROM jobpost")
# cursor.execute("DELETE FROM department")
# cursor.execute("DELETE FROM field_name_score")
# cursor.execute("DELETE FROM weight")
# cursor.execute("DELETE FROM notification")
# cursor.execute("DELETE FROM schedule")
# cursor.execute("DELETE FROM users")
# cursor.execute("DELETE FROM company")
# cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
# conn.commit()


#테이블 없을 시 건너뛰고 계속 실행
tables = [
    "schedule_interview",
    "interview_evaluation",
    "interview_question",
    "evaluation_detail",
    "application",
    "applicant_user",
    "company_user",
    "resume_memo",
    "spec",
    "resume",
    "jobpost_role",
    "jobpost",
    "department",
    "field_name_score",
    "weight",
    "notification",
    "schedule",
    "users",
    "company"
]

cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

for table in tables:
    try:
        cursor.execute(f"DELETE FROM {table}")
        print(f"✅ Deleted: {table}")
    except pymysql.err.ProgrammingError as e:
        print(f"⚠️ Skipped (table not found): {table} → {e}")

cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
conn.commit()

# ID 매핑 딕셔너리
user_id_map = {}
resume_id_map = {}
company_id_map = {}
department_id_map = {}
jobpost_id_map = {}
application_id_map = {}
schedule_id_map = {}
company_user_id_map = {}
interview_id_map = {}
evaluation_id_map = {}

# === COMPANY ===
print("🏢 Inserting companies...")
with open("../data/company.json", "r", encoding="utf-8") as f:
    for company in json.load(f):
        bus_num = company.get("bus_num", "")  # 새로 추가된 bus_num
        cursor.execute(
            "INSERT INTO company (name, description, address, phone, website, bus_num, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())",
            (company["name"], company.get("description"), company["address"], company.get("phone"), company.get("website"), bus_num)
        )
        company_id_map[company["name"]] = cursor.lastrowid
print("✅ Companies inserted!")

print("✅ COMPANY 테이블 삽입 완료")
conn.commit()


# === USERS ===
print("👤 Inserting users...")
with open("../data/users.json", "r", encoding="utf-8") as f:
    for user in json.load(f):
        for key in ["birth_date", "created_at", "updated_at"]:
            if key in user:
                user[key] = parse_datetime(user[key])

        cursor.execute("""
            INSERT INTO users
                (name, email, password, phone, user_type,
                 birth_date, gender, address, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s)
        """, (
            user["name"], user["email"], user["password"], user.get("phone"),
            user.get("user_type"),
            user.get("birth_date"), user.get("gender"), user.get("address"),
            user.get("created_at"), user.get("updated_at")
        ))
        user_id_map[user["email"]] = cursor.lastrowid   # 그대로 유지

print("✅ USERS 테이블 삽입 완료")
conn.commit()


# users 로딩
cursor.execute("SELECT id, email FROM users")
for uid, email in cursor.fetchall():
    user_id_map[email] = uid

# company 로딩
cursor.execute("SELECT id, name FROM company")
for cid, name in cursor.fetchall():
    company_id_map[name] = cid

# jobpost 로딩
cursor.execute("SELECT id, title, company_id FROM jobpost")
for jid, title, cid in cursor.fetchall():
    jobpost_id_map[(title, cid)] = jid

# company_user 로딩
cursor.execute("SELECT id, email FROM users WHERE user_type = 'COMPANY'")
for uid, email in cursor.fetchall():
    company_user_id_map[email] = uid

# === RESUME ===
print("📄 Inserting resumes...")
with open("../data/resume.json", "r", encoding="utf-8") as f:
    for resume in json.load(f):
        email = resume["personal_info"]["email"]
        user_id = user_id_map.get(email)
        content = json.dumps(resume.get("self_introduction", []), ensure_ascii=False, indent=2)
        cursor.execute("""
            INSERT INTO resume (user_id, title, content, file_url, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
        """, (user_id, "기본 이력서", content, ""))
        resume_id_map[email] = cursor.lastrowid


print("✅ RESUME 테이블 삽입 완료")
conn.commit()

# === SPEC ===
print("📑 Inserting specs...")
with open("../data/spec.json", "r", encoding="utf-8") as f:
    specs = json.load(f)

spec_idx = 0
resume_idx = 0
specs_len = len(specs)

for email, resume_id in resume_id_map.items():
    while spec_idx < specs_len:
        spec = specs[spec_idx]

        # 새로운 이력서의 시작은 education + institution 항목으로 판단
        if spec["spec_type"] == "education" and spec["spec_title"] == "institution":
            if resume_idx >= len(resume_id_map):
                break
            resume_id = list(resume_id_map.values())[resume_idx]
            resume_idx += 1

        cursor.execute("""
            INSERT INTO spec (resume_id, spec_type, spec_title, spec_description)
            VALUES (%s, %s, %s, %s)
        """, (resume_id, spec["spec_type"], spec["spec_title"], spec["spec_description"]))

        spec_idx += 1
print("✅ Specs inserted!")

print("✅ SPEC 테이블 삽입 완료")
conn.commit()



# === DEPARTMENT ===
print("🏬 Inserting departments...")
with open("../data/department.json", "r", encoding="utf-8") as f:
    departments = json.load(f)

for dept in departments:
    company_name = dept["company"]
    company_id = company_id_map.get(company_name)
    if not company_id:
        print(f"❗ company_id_map에 없는 회사명: {company_name}")
        continue

    cursor.execute("""
        INSERT INTO department (name, description, job_function, created_at, updated_at, company_id)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        dept["name"],
        dept.get("description"),
        dept["job_function"],
        parse_datetime(dept["created_at"]),
        parse_datetime(dept["created_at"]),
        company_id
    ))

    department_id_map[(dept["name"], company_id)] = cursor.lastrowid

print("✅ DEPARTMENT 테이블 삽입 완료")
conn.commit()




# === JOBPOST ===
print("💼 Inserting jobposts...")
with open("../data/jobpost.json", "r", encoding="utf-8") as f:
    for entry in json.load(f):
        company_id = company_id_map.get(entry["company"])
        for post in entry["jobposts"]:
            dept_name = post["department_name"]
            department_id = department_id_map.get((dept_name, company_id))
            cursor.execute("""
                INSERT INTO jobpost (company_id, department_id, user_id, title, department, qualifications, conditions, job_details, procedures, headcount, start_date, end_date, location, employment_type, deadline, team_members, weights, status, created_at, updated_at)
                VALUES (%s, %s, NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                company_id, department_id, post["title"], post.get("department_name"), post["qualifications"], post["conditions"],
                post["job_details"], post["procedure"], post["headcount"],
                parse_datetime(post["start_date"]), parse_datetime(post["end_date"]),
                post.get("location"), post.get("employment_type"), post.get("deadline"),
                post.get("team_members"), post.get("weights"), post.get("status", "ACTIVE"),
                parse_datetime(post["created_at"]), parse_datetime(post["updated_at"])
            ))
            jobpost_id_map[(post["title"], company_id)] = cursor.lastrowid
print("✅ Jobposts inserted!")


print("✅ JOBPOST 테이블 삽입 완료")
conn.commit()


# === WEIGHT ===
print("⚖️ Inserting weights...")
with open("../data/weight.json", "r", encoding="utf-8") as f:
    for entry in json.load(f):
        company_id = company_id_map.get(entry["company"])
        if not company_id: 
            print(f"⚠️ company_id 매핑 실패 - company: {entry['company']}")
            continue
        for post in entry.get("jobposts", []):
            jobpost_id = jobpost_id_map.get((post["title"], company_id))
            if not jobpost_id:
                print(f"⚠️ jobpost_id 매핑 실패 - title: {post['title']}, company: {entry['company']}")
                continue
            for w in post.get("weight", []):
                cursor.execute("""
                    INSERT INTO weight (target_type, jobpost_id, field_name, weight_value, updated_at)
                    VALUES (%s, %s, %s, %s, NOW())
                """, (w["targetType"], jobpost_id, w["fieldName"], float(w["weightValue"])))
print("✅ Weights inserted!")


print("✅ WEIGHT 테이블 삽입 완료")
conn.commit()


# === COMPANY_USER ===
print("👥 Inserting company users...")
with open("../data/company_user.json", "r", encoding="utf-8") as f:
    for cu in json.load(f):
        email = cu["email"]
        company_name = cu["company"]
        ranks = cu["rank"]
        joined_at = parse_datetime(cu["joined_at"])

        user_id = user_id_map.get(email)
        company_id = company_id_map.get(company_name)

        if user_id and company_id:
            cursor.execute("""
                        INSERT INTO company_user (id, company_id, department_id, ranks, joined_at)
        VALUES (%s, %s, %s, %s, %s)
            """, (user_id, company_id, None, ranks, joined_at))
            company_user_id_map[email] = user_id
        else:
            print(f"⚠️ 매핑 실패 - email: {email}, company: {company_name}")

print("✅ COMPANY_USER 테이블 삽입 완료")
conn.commit()



# === SCHEDULE ===
# with open("../data/schedule.json", "r", encoding="utf-8") as f:
#     for sch in json.load(f):
#         user_id = company_user_id_map.get(sch["user_email"])
#         cursor.execute("""
#             INSERT INTO schedule (schedule_type, user_id, title, description, location, scheduled_at, status)
#             VALUES (%s, %s, %s, %s, %s, %s, %s)
#         """, (
#             sch["schedule_type"], user_id, sch["title"], sch["description"],
#             sch["location"], parse_datetime(sch["scheduled_at"]), sch["status"]
#         ))
#         schedule_id_map[sch["title"]] = cursor.lastrowid

# === APPLICANT_USER ===
print("🎓 Inserting applicant users...")
with open("../data/applicant_user_list.json", "r", encoding="utf-8") as f:
    for a in json.load(f):
        email = a["email"]
        user_id = user_id_map.get(email)
        if user_id:
            cursor.execute("INSERT INTO applicant_user (id, resume_file_path) VALUES (%s, %s)", (user_id, None))
        else:
            print(f"⚠️ 사용자 ID를 찾을 수 없음: {email}")
print("✅ Applicant users inserted!")


print("✅ APPLICANT_USER 테이블 삽입 완료")
conn.commit()




# === APPLICATION ===
print("📝 Inserting applications...")
with open("../data/application.json", "r", encoding="utf-8") as f:
    for app in json.load(f):
        email = app["email"]
        user_id = user_id_map.get(email)
        resume_id = resume_id_map.get(email)
        company_id = company_id_map.get(app["company"])
        jobpost_id = jobpost_id_map.get((app["title"], company_id))
        if None in (user_id, resume_id, jobpost_id):
            print(f"❌ 매핑 실패 → {app}")
            continue
        cursor.execute("""
            INSERT INTO application (user_id, resume_id, job_post_id, status, applied_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (
            user_id, resume_id, jobpost_id,
            app["status"]
        ))
        application_id_map[(email, app["title"])] = cursor.lastrowid
print("✅ Applications inserted!")


print("✅ APPLICATION 테이블 삽입 완료")
conn.commit()



# === FIELD_NAME_SCORE ===
print("📊 Inserting field name scores...")
with open("../data/field_name_score.json", "r", encoding="utf-8") as f:
    scores = json.load(f)
    for s in scores:
        application_id = application_id_map.get((s["email"], s["jobpost_title"]))
        if not application_id:
            print(f"⚠️ application_id 매핑 실패 - email: {s['email']}, jobpost_title: {s['jobpost_title']}")
            continue
        cursor.execute("INSERT INTO field_name_score (application_id, field_name, score) VALUES (%s, %s, %s)", (application_id, s["field_name"], s["score"]))
print("✅ Field name scores inserted!")

print("✅ FIELD_NAME_SCORE 테이블 삽입 완료")
conn.commit()



# === JOBPOST_ROLE ===   (구 job.json 재활용)
with open("../data/jobpost_role.json", "r", encoding="utf-8") as f:
    for rec in json.load(f):
        email        = rec["email"]
        company_name = rec["company"]
        role         = rec.get("role", "MANAGER")               # 기본값: MANAGER
        granted_at   = parse_datetime(rec.get("invited_at")) or datetime.now()

        # ① company_user_id 확보 (없으면 즉석에서 INSERT)
        company_user_id = company_user_id_map.get(email)
        if company_user_id is None:
            user_id    = user_id_map.get(email)
            company_id = company_id_map.get(company_name)

            if user_id and company_id:
                cursor.execute("""
                    INSERT INTO company_user (id, company_id, department_id, ranks, joined_at)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, company_id, None, None, None))
                company_user_id = user_id
                company_user_id_map[email] = user_id
            else:
                print(f"⚠️ company_user 매핑 실패 → {rec}")
                continue

        # ② jobpost_id 매핑
        jobpost_id = jobpost_id_map.get((rec["jobpost_title"], company_id_map.get(company_name)))
        if not jobpost_id:
            print(f"❌ jobpost_id 매핑 실패 → {rec}")
            continue

        # ③ 권한 부여
        cursor.execute("""
            INSERT INTO jobpost_role (jobpost_id, company_user_id, role, granted_at)
            VALUES (%s, %s, %s, %s)
        """, (jobpost_id, company_user_id, role, granted_at))


print("✅ JOBPOST_ROLE 테이블 삽입 완료")
conn.commit()



# === SCHEDULE_INTERVIEW ===
# with open("data/schedule_interview.json", "r", encoding="utf-8") as f:
#     for i in json.load(f):
#         schedule_id = schedule_id_map.get(i["schedule_title"])
#         user_id = company_user_id_map.get(i["email"])
#         cursor.execute("INSERT INTO schedule_interview (schedule_id, user_id, schedule_date, status) VALUES (%s, %s, %s, %s)",
#                        (schedule_id, user_id, parse_datetime(i["schedule_date"]), i["status"]))
#         interview_id_map[i["email"]] = cursor.lastrowid

# === NOTIFICATION ===
# with open("data/notification.json", "r", encoding="utf-8") as f:
#     for n in json.load(f):
#         user_id = user_id_map.get(n["email"])
#         cursor.execute("INSERT INTO notification (message, user_id, type, is_read, created_at) VALUES (%s, %s, %s, %s, NOW())",
#                        (n["message"], user_id, n["type"], n["is_read"]))

# === RESUME_MEMO ===
print("📝 Inserting resume memos...")
with open("../data/resume_memo.json", "r", encoding="utf-8") as f:
    for m in json.load(f):
        user_id = company_user_id_map.get(m["email"])
        application_id = application_id_map.get(m["email"])
        cursor.execute("INSERT INTO resume_memo (user_id, application_id, content, created_at) VALUES (%s, %s, %s, NOW())",
                       (user_id, application_id, m["content"]))
print("✅ Resume memos inserted!")

print("✅ RESUME_MEMO 테이블 삽입 완료")
conn.commit()


# === INTERVIEW_EVALUATION ===
# with open("data/interview_evaluation.json", "r", encoding="utf-8") as f:
#     for e in json.load(f):
#         interview_id = interview_id_map.get(e["email"])
#         evaluator_id = company_user_id_map.get(e["email"]) if not e["is_ai"] else None
#         cursor.execute("INSERT INTO interview_evaluation (interview_id, evaluator_id, is_ai, score, summary, created_at) VALUES (%s, %s, %s, %s, %s, NOW())",
#                        (interview_id, evaluator_id, e["is_ai"], e["score"], e["summary"]))
#         evaluation_id_map[e["email"]] = interview_id

# === EVALUATION_DETAIL ===
# with open("data/evaluation_detail.json", "r", encoding="utf-8") as f:
#     for d in json.load(f):
#         evaluation_id = evaluation_id_map.get(d["email"])
#         cursor.execute("INSERT INTO evaluation_detail (evaluation_id, category, grade, score) VALUES (%s, %s, %s, %s)",
#                        (evaluation_id, d["category"], d["grade"], d["score"]))

# === INTERVIEW_QUESTION ===
# with open("data/interview_question.json", "r", encoding="utf-8") as f:
#     for q in json.load(f):
#         application_id = application_id_map.get(q["email"])
#         cursor.execute("INSERT INTO interview_question (application_id, type, question_text) VALUES (%s, %s, %s)",
#                        (application_id, q["type"], q["question_text"]))

# 마무리
conn.commit()
cursor.close()
conn.close()
