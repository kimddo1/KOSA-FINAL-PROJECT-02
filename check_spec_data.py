import json

def find_spec_by_resume_id(resume_id):
    """특정 resume_id의 spec 데이터를 찾습니다."""
    try:
        with open('data/spec.json', 'r', encoding='utf-8') as f:
            specs = json.load(f)
        
        # resume_id가 42인 데이터 찾기
        target_specs = [spec for spec in specs if spec.get('resume_id') == resume_id]
        
        if not target_specs:
            print(f"resume_id {resume_id}인 데이터가 없습니다.")
            return
        
        print(f"=== resume_id {resume_id}인 Spec 데이터 ({len(target_specs)}개) ===")
        
        # spec_type별로 분류
        education_specs = [s for s in target_specs if s.get('spec_type') == 'education']
        awards_specs = [s for s in target_specs if s.get('spec_type') == 'awards']
        certifications_specs = [s for s in target_specs if s.get('spec_type') == 'certifications']
        skills_specs = [s for s in target_specs if s.get('spec_type') == 'skills']
        activities_specs = [s for s in target_specs if s.get('spec_type') == 'activities']
        project_experience_specs = [s for s in target_specs if s.get('spec_type') == 'project_experience']
        
        print(f"\n📚 교육정보 ({len(education_specs)}개):")
        for spec in education_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n🏆 수상내역 ({len(awards_specs)}개):")
        for spec in awards_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n📜 자격증 ({len(certifications_specs)}개):")
        for spec in certifications_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n💻 기술 ({len(skills_specs)}개):")
        for spec in skills_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n🎯 활동 ({len(activities_specs)}개):")
        for spec in activities_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n🚀 프로젝트 경험 ({len(project_experience_specs)}개):")
        for spec in project_experience_specs:
            print(f"  - {spec.get('spec_title')}: {spec.get('spec_description')}")
        
        print(f"\n=== 전체 데이터 ===")
        for i, spec in enumerate(target_specs, 1):
            print(f"{i}. ID: {spec.get('id')}, Type: {spec.get('spec_type')}, Title: {spec.get('spec_title')}, Description: {spec.get('spec_description')}")
            
    except FileNotFoundError:
        print("data/spec.json 파일을 찾을 수 없습니다.")
    except json.JSONDecodeError:
        print("JSON 파일 형식이 올바르지 않습니다.")
    except Exception as e:
        print(f"오류 발생: {e}")

def find_application_by_resume_id(resume_id):
    """특정 resume_id의 application 데이터를 찾습니다."""
    try:
        with open('data/application.json', 'r', encoding='utf-8') as f:
            applications = json.load(f)
        
        # resume_id가 42인 데이터 찾기 (만약 필드가 있다면)
        target_applications = []
        for app in applications:
            if app.get('resume_id') == resume_id:
                target_applications.append(app)
        
        if not target_applications:
            print(f"resume_id {resume_id}인 application 데이터가 없습니다.")
            print("application.json의 필드들:", list(applications[0].keys()) if applications else "빈 파일")
            return
        
        print(f"\n=== resume_id {resume_id}인 Application 데이터 ===")
        for app in target_applications:
            print(f"Email: {app.get('email')}")
            print(f"Status: {app.get('status')}")
            print(f"Score: {app.get('score')}")
            print(f"Applied at: {app.get('applied_at')}")
            print("---")
            
    except FileNotFoundError:
        print("data/application.json 파일을 찾을 수 없습니다.")
    except json.JSONDecodeError:
        print("JSON 파일 형식이 올바르지 않습니다.")
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    resume_id = 42
    print(f"resume_id {resume_id}인 데이터를 찾는 중...")
    
    find_spec_by_resume_id(resume_id)
    find_application_by_resume_id(resume_id) 