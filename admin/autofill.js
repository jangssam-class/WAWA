(function () {
  'use strict';

  var EVENT_NAME = 'wawa:autofill-post';
  var REGISTRY = [];

  function fieldName(props) {
    return props && props.field && props.field.get ? props.field.get('name') : '';
  }

  function registerAutofillWrapper(name, baseWidgetName) {
    var base = CMS.getWidget && CMS.getWidget(baseWidgetName);
    if (!base || !base.control) {
      console.error('[WAWA autofill] 기본 위젯을 찾지 못했습니다:', baseWidgetName);
      return;
    }

    var BaseControl = base.control;
    var Wrapper = createClass({
      getInitialState: function () {
        return { forcedValue: undefined };
      },

      componentDidMount: function () {
        REGISTRY.push(this);
      },

      componentWillUnmount: function () {
        var i = REGISTRY.indexOf(this);
        if (i >= 0) REGISTRY.splice(i, 1);
      },

      componentWillReceiveProps: function (nextProps) {
        // Decap 저장 데이터가 새 값으로 따라오면 강제 표시값을 해제합니다.
        if (this.state.forcedValue !== undefined && nextProps.value === this.state.forcedValue) {
          this.setState({ forcedValue: undefined });
        }
      },

      handleChange: function (value) {
        // 사용자가 왼쪽 칸을 직접 수정할 때도 Decap 데이터와 화면을 동시에 갱신합니다.
        this.setState({ forcedValue: value });
        if (typeof this.props.onChange === 'function') this.props.onChange(value);
      },

      applyAutofill: function (data) {
        if (!data) return false;
        var name = fieldName(this.props);
        if (!name || !Object.prototype.hasOwnProperty.call(data, name)) return false;
        if (typeof this.props.onChange !== 'function') return false;
        var value = data[name];

        // 핵심 수정: Decap 원본 데이터(오른쪽 미리보기)뿐 아니라
        // 이 위젯 자체의 표시값(왼쪽 입력칸)도 즉시 같은 값으로 바꿉니다.
        this.setState({ forcedValue: value });
        this.props.onChange(value);
        return true;
      },

      render: function () {
        var self = this;
        var childProps = {};
        Object.keys(this.props || {}).forEach(function (k) { childProps[k] = self.props[k]; });
        if (this.state.forcedValue !== undefined) childProps.value = this.state.forcedValue;
        childProps.onChange = this.handleChange;

        return h(
          'div',
          {
            ref: function (el) { self._wrap = el; },
            'data-wawa-field': fieldName(this.props)
          },
          h(BaseControl, childProps)
        );
      }
    });

    CMS.registerWidget(name, Wrapper, base.preview);
  }

  // Decap의 각 필드가 자기 onChange를 직접 호출하도록 감싸서
  // React 제어 입력값을 DOM으로 억지 변경하지 않고 안전하게 자동 입력합니다.
  registerAutofillWrapper('wawa_string_autofill', 'string');
  registerAutofillWrapper('wawa_text_autofill', 'text');
  registerAutofillWrapper('wawa_select_autofill', 'select');
  registerAutofillWrapper('wawa_datetime_autofill', 'datetime');
  registerAutofillWrapper('wawa_markdown_autofill', 'markdown');


  // 포스팅 지역 선택값: 코칭센터_데이터_260917.xlsx의 203개 실제 센터 주소/센터명에서만 생성
  var LOCATION_OPTIONS = {"서울":{"강동구":["명일동"],"강북구":["미아동"],"강서구":["내발산동","신방화동","염창동"],"광진구":["광장동"],"구로구":["신도림동"],"금천구":["제중심상가동"],"노원구":["하계동"],"동대문구":["제기동"],"마포구":["마포2호","상암동","염리동"],"서대문구":["가좌동"],"성북구":["돈암동","동소문동","종암동"],"송파구":["송파위례동"],"양천구":["목동"],"영등포구":["당산동"],"은평구":["역촌동","은평동","진관동"]},"부산":{"동래구":["사직동","온천동"],"북구":["화명동"],"해운대구":["반여동","좌동"]},"대구":{"달서구":["대구장기동","월성동","이곡동","진천동"],"동구":["율하동","이시아폴리스"],"북구":["대구도남동","상가동","칠곡동","침산동"],"수성구":["수성2가","수성만촌동","알파시티동"],"중구":["대구역동","대구역점2호관","반월당동"]},"인천":{"남동구":["구월동","논현동"],"부평구":["부평동","인천삼산동"],"서구":["루원시티동","청라동"],"연수구":["동춘동","송도동","웰카운티동"]},"광주":{"광산구":["선운동","수완동","신창동","첨단동"],"남구":["진월동"],"서구":["치평동"]},"대전":{"대덕구":["송촌동"],"서구":["관저동","도안동","둔산동"],"유성구":["관평동","반석동","지족동"],"중구":["태평동"]},"울산":{"남구":["삼산동"],"북구":["송정동"],"중구":["남외동","복산동"]},"세종":{"세종시":["새롬"]},"경기":{"고양시 덕양구":["삼송","원당","원흥","행신","화정"],"고양시 일산동구":["마두","중산","풍동"],"고양시 일산서구":["덕이","주엽동","탄현","후곡"],"광명시":["광명","소하","철산동"],"광주시":["탄벌"],"구리시":["갈매","인창"],"군포시":["산본"],"김포시":["사우","운양","장기동"],"남양주시":["다산","다산도농","다산지금","별가람","별내","별내중앙","진접읍","퇴계원읍","평내","호평"],"부천시 소사구":["범박","옥길","옥길스타"],"부천시 원미구":["상동","신중동","제상가동","중동"],"성남시 분당구":["금곡동","이매동"],"성남시 수정구":["단대","위례","위례창곡"],"성남시 중원구":["수진","야탑"],"수원시 권선구":["서수원","호매실"],"수원시 영통구":["망포동","영통구청","영통동"],"수원시 장안구":["천천"],"시흥시":["목감","배곧","시흥대야","장곡"],"안산시 단원구":["고잔"],"안양시 동안구":["비산"],"양주시":["옥정"],"오산시":["세교","오산","오산대역"],"용인시 기흥구":["기흥구청","동백","보라","용인백현","흥덕"],"용인시 수지구":["상현동","수지","신봉"],"용인시 처인구":["명지대역"],"의정부시":["신곡동"],"이천시":["갈산동","부발읍"],"파주시":["교하","금릉","동패동","산내","운정호수"],"평택시":["비전동","이충"],"하남시":["미사","센트럴","하남풍산"],"화성시":["동탄목동","동탄호수","반송동","병점","봉담읍","영천","향남읍"]},"강원":{"강릉시":["강릉교동"],"원주시":["단구","원주시청","혁신"],"춘천시":["석사","후평"]},"충북":{"청주시 서원구":["개신동","산남동"],"청주시 흥덕구":["가경","복대"],"충주시":["용산동","칠금동"]},"충남":{"당진시":["당진중앙"],"아산시":["탕정면"],"천안시 동남구":["신방동"],"천안시 서북구":["두정동","불당","쌍용동"]},"전북":{"완주군":["이서면"],"전주시 덕진구":["송천"],"전주시 완산구":["서신"]},"경북":{"경산시":["사동","정평"],"구미시":["옥계"],"포항시 북구":["두호","양덕"]},"경남":{"거제시":["거제수월"],"창원시 성산구":["상남"],"창원시 진해구":["석동"]},"제주":{"제주시":["노형"]}};
  var eng = {
    서울: 'seoul', 부산: 'busan', 대구: 'daegu', 인천: 'incheon', 광주: 'gwangju',
    대전: 'daejeon', 울산: 'ulsan', 세종: 'sejong', 경기: 'gyeonggi', 강원: 'gangwon',
    충북: 'chungbuk', 충남: 'chungnam', 전북: 'jeonbuk', 전남: 'jeonnam',
    경북: 'gyeongbuk', 경남: 'gyeongnam', 제주: 'jeju',
    초등학생: 'elementary', 중학생: 'middle', 고등학생: 'high', 초중등: 'elem-middle',
    중고등: 'middle-high', 초중고: 'all-grades', 국어: 'korean', 영어: 'english',
    수학: 'math', 과학: 'science', 사회: 'social', 국영수: 'kem', 전과목: 'all-subjects'
  };

  function romanizeSubregion(text) {
    // 세부 지역은 한글을 억지 음역하지 않고, 충돌 방지를 위해 안전한 짧은 코드로 만듭니다.
    // 사용자가 필요하면 slug만 직접 수정할 수 있습니다.
    var s = String(text || '').trim();
    if (!s) return '';
    var common = {
      강남구: 'gangnam', 강서구: 'gangseo', 강동구: 'gangdong', 강북구: 'gangbuk',
      송파구: 'songpa', 서초구: 'seocho', 마포구: 'mapo', 동작구: 'dongjak',
      동래구: 'dongnae', 해운대구: 'haeundae', 부산진구: 'busanjin', 사하구: 'saha',
      수영구: 'suyeong', 북구: 'bukgu', 남구: 'namgu', 동구: 'donggu', 서구: 'seogu',
      중구: 'junggu', 달서구: 'dalseo', 수성구: 'suseong', 연수구: 'yeonsu',
      남동구: 'namdong', 부평구: 'bupyeong', 유성구: 'yuseong', 광산구: 'gwangsan',
      창원시: 'changwon', 김해시: 'gimhae', 양산시: 'yangsan', 전주시: 'jeonju',
      청주시: 'cheongju', 천안시: 'cheonan', 제주시: 'jeju-si', 서귀포시: 'seogwipo'
    };
    return common[s] || '';
  }

  function makeSlug(region, subregion, target, subject, topic) {
    var parts = [];
    if (eng[region]) parts.push(eng[region]);
    var sub = romanizeSubregion(subregion);
    if (sub) parts.push(sub);
    if (eng[target]) parts.push(eng[target]);
    if (eng[subject]) parts.push(eng[subject]);

    var topicCode = {
      '학원 선택 전 확인할 5가지': 'academy-checklist',
      '성적이 오르지 않는 이유와 공부법': 'score-study-guide',
      '내신 대비 공부방법': 'school-exam-guide',
      '시험 전 4주 학습계획': 'four-week-plan',
      '기초가 부족한 학생 공부방법': 'basic-study-guide',
      '오답관리 제대로 하는 방법': 'wrong-answer-guide',
      '학습 습관 만드는 방법': 'study-habit-guide',
      '소수정예 학원의 장점': 'small-class-benefits',
      '개별진도 수업이 필요한 이유': 'individual-pace',
      '학부모가 학원 선택 전 확인할 것': 'parent-academy-guide'
    }[topic] || 'academy-guide';
    parts.push(topicCode);
    return parts.join('-');
  }

  function topicIntro(v, place, points) {
    var common = place + '에서 ' + v.target + ' ' + v.subject + '학원을 알아보는 학부모를 위해 ';
    var map = {
      '학원 선택 전 확인할 5가지': '수업 방식, 학생 관리, 질문과 피드백, 오답관리, 시험 대비에서 확인할 기준을 정리했습니다.',
      '성적이 오르지 않는 이유와 공부법': '공부시간을 늘려도 성적이 정체되는 원인과 점검해야 할 학습 방법을 정리했습니다.',
      '내신 대비 공부방법': '학교 시험을 준비할 때 개념 정리부터 유형 연습, 오답관리까지 이어지는 내신 대비 방법을 정리했습니다.',
      '시험 전 4주 학습계획': '시험 4주 전부터 주차별로 무엇을 준비하면 좋은지 현실적인 학습 계획을 정리했습니다.',
      '기초가 부족한 학생 공부방법': '기초가 부족한 학생이 무리한 진도보다 먼저 확인해야 할 개념과 학습 순서를 정리했습니다.',
      '오답관리 제대로 하는 방법': '틀린 문제를 다시 풀기만 하는 방식에서 벗어나 오답 원인을 찾고 재학습하는 방법을 정리했습니다.',
      '학습 습관 만드는 방법': '매일 공부를 이어가기 어려운 학생이 작은 루틴부터 학습 습관을 만드는 방법을 정리했습니다.',
      '소수정예 학원의 장점': '소수정예 수업에서 학생별 이해도와 진도, 질문과 피드백이 어떻게 연결되는지 정리했습니다.',
      '개별진도 수업이 필요한 이유': '학생마다 다른 이해도와 학습 속도에 맞춰 개별 진도가 필요한 이유를 정리했습니다.',
      '학부모가 학원 선택 전 확인할 것': '상담 전에 확인하면 좋은 수업 방식과 학습관리 기준을 학부모 관점에서 정리했습니다.'
    };
    return common + (map[v.topic] || map['학원 선택 전 확인할 5가지']) + ' WAWA의 ' + points + ' 운영 방식도 함께 살펴봅니다.';
  }

  function buildBody(v, place, points) {
    var topicLead = {
      '학원 선택 전 확인할 5가지': '학원을 선택할 때는 유명세나 진도 속도만 보기보다 학생의 현재 수준을 어떻게 진단하고, 수업 중 질문과 피드백이 얼마나 구체적으로 이어지는지 확인해야 합니다.',
      '성적이 오르지 않는 이유와 공부법': '공부시간을 늘렸는데도 성적이 정체된다면 학습량보다 학습 과정부터 점검할 필요가 있습니다. 개념 이해, 문제 적용, 오답 원인, 복습 중 어느 단계가 끊기는지 확인하는 것이 먼저입니다.',
      '내신 대비 공부방법': '내신 대비는 시험 직전 문제풀이만으로 완성되기 어렵습니다. 학교 진도에 맞춘 개념 정리와 유형 연습, 서술형 대비, 오답 재점검이 순서대로 연결되어야 합니다.',
      '시험 전 4주 학습계획': '시험 4주 전부터는 범위 확인과 개념 정리, 유형 연습, 취약 단원 보완, 실전 점검을 주차별로 나누어 준비하는 것이 좋습니다.',
      '기초가 부족한 학생 공부방법': '기초가 부족한 학생은 어려운 문제를 많이 푸는 것보다 현재 학년에서 꼭 필요한 핵심 개념을 다시 확인하고, 풀 수 있는 문제부터 정확도를 높이는 과정이 먼저입니다.',
      '오답관리 제대로 하는 방법': '오답관리는 정답을 옮겨 적는 일이 아니라 틀린 이유를 찾아 다음 문제에서 같은 실수를 줄이는 과정입니다. 개념 부족, 해석 오류, 계산 실수 등을 구분해야 합니다.',
      '학습 습관 만드는 방법': '학습 습관은 긴 공부시간을 한 번 만드는 것보다 일정한 시작 시간과 작은 분량을 매일 지키는 과정에서 만들어집니다.',
      '소수정예 학원의 장점': '소수정예 수업의 핵심은 단순히 학생 수가 적다는 데 있지 않습니다. 학생별 이해도와 진도를 확인하고 필요한 설명과 문제를 바로 연결할 수 있는지가 중요합니다.',
      '개별진도 수업이 필요한 이유': '같은 학년이라도 학생마다 강한 단원과 취약 단원이 다릅니다. 개별진도는 현재 이해도를 기준으로 필요한 부분을 보완하면서 다음 단계로 넘어가기 위한 방식입니다.',
      '학부모가 학원 선택 전 확인할 것': '학원 상담에서는 수업 시간과 비용뿐 아니라 학생 수준을 어떻게 진단하는지, 숙제와 오답을 어떻게 관리하는지, 시험 대비가 어떤 순서로 진행되는지 확인하는 것이 좋습니다.'
    }[v.topic] || '학생에게 맞는 학습 환경을 찾으려면 현재 수준과 수업 방식, 학습관리 과정을 함께 확인하는 것이 중요합니다.';

    var body =
      '## ' + place + ' ' + v.target + ' ' + v.subject + ', ' + v.topic + '\n\n' +
      place + '에서 ' + v.target + ' ' + v.subject + ' 학습을 고민하고 있다면 먼저 학생에게 필요한 것이 무엇인지 구체적으로 살펴볼 필요가 있습니다. ' + topicLead + ' 특히 같은 학년이라도 개념 이해도와 문제풀이 속도, 공부 습관은 서로 다르기 때문에 한 가지 방식만 모든 학생에게 적용하기는 어렵습니다.\n\n' +
      '## 1. 현재 수준과 취약점을 먼저 확인하세요\n\n' +
      '학습 계획을 세우기 전에는 현재 어느 단원까지 이해하고 있는지, 어떤 유형에서 반복해서 틀리는지 확인해야 합니다. 단순히 점수만 보는 것보다 개념을 몰라서 틀리는지, 문제의 조건을 놓치는지, 계산이나 암기 과정에서 실수가 생기는지를 나누어 보는 것이 중요합니다. 진단이 정확해야 필요한 부분에 시간을 집중할 수 있고 무리한 선행이나 반복 학습도 줄일 수 있습니다.\n\n' +
      '## 2. 설명을 들은 뒤 스스로 적용하는 과정이 필요합니다\n\n' +
      v.subject + ' 공부는 설명을 이해한 것과 문제를 혼자 해결할 수 있는 것이 다를 수 있습니다. 수업에서 배운 개념을 기본 문제에 적용하고, 이후 유형을 조금씩 확장하면서 학생이 스스로 풀이 과정을 설명할 수 있는지 확인하는 것이 좋습니다. 막히는 지점에서는 바로 질문하고 피드백을 받아 잘못 이해한 부분을 수정해야 다음 단원에서도 흔들리지 않습니다.\n\n' +
      '## 3. 오답은 정답보다 틀린 이유를 기록하세요\n\n' +
      '틀린 문제를 다시 풀 때는 답만 맞히는 것으로 끝내지 않는 것이 좋습니다. 개념 부족, 조건 해석 오류, 풀이 순서 문제, 단순 실수처럼 원인을 구분하고 며칠 뒤 비슷한 문제를 다시 풀어보면 실제로 보완됐는지 확인할 수 있습니다. 반복되는 오답 유형이 보이면 해당 개념으로 돌아가 짧게 복습한 뒤 다시 적용하는 방식이 효율적입니다.\n\n' +
      '## 4. 내신 대비는 평소 학습과 연결되어야 합니다\n\n' +
      '학교 시험은 범위가 정해져 있기 때문에 평소 진도와 시험 대비가 따로 움직이지 않도록 관리하는 것이 중요합니다. 시험 기간에는 범위를 다시 확인하고 핵심 개념과 학교별 출제 유형을 정리한 뒤 취약 단원과 기존 오답을 우선 점검하는 것이 좋습니다. 마지막에는 시간 안에 문제를 해결하는 연습과 서술형·실수 점검까지 이어져야 합니다.\n\n' +
      '## 5. ' + v.topic + '에서 꼭 볼 부분\n\n' +
      '학부모가 학원을 알아볼 때는 상담에서 학생의 현재 상태를 얼마나 구체적으로 묻는지 살펴보세요. 수업 인원만 확인하기보다 진도 결정 방식, 숙제 확인, 질문 가능 여부, 오답 피드백, 시험 기간 관리가 실제로 어떻게 운영되는지 확인하는 편이 좋습니다. 학생에게 필요한 관리가 무엇인지 설명할 수 있는 곳인지도 중요한 기준이 됩니다.\n\n' +
      '## WAWA의 소수정예 학습관리\n\n' +
      'WAWA는 ' + points + '을 중심으로 학생 한 명 한 명의 학습 과정을 세밀하게 확인하는 수업을 지향합니다. 학생별 이해도와 학습 속도를 살피고 필요한 설명과 문제를 연결하며, 오답과 시험 준비 과정도 지속적으로 점검하는 방식입니다. 다만 센터마다 운영 학년과 과목, 세부 수업 방식은 다를 수 있으므로 홈페이지에서 가까운 센터를 검색한 뒤 상담을 통해 확인하는 것이 좋습니다.\n\n' +
      '## 상담 전에 준비하면 좋은 내용\n\n' +
      '상담 전에는 최근 시험 점수만 준비하기보다 어려워하는 단원, 자주 틀리는 문제 유형, 하루 공부시간, 숙제 수행 습관, 현재 사용 중인 교재를 함께 정리해두세요. 이런 정보가 있으면 학생에게 필요한 진도와 관리 방법을 더 구체적으로 이야기할 수 있습니다. ' + place + ' ' + v.target + ' ' + v.subject + ' 학원을 찾고 있다면 학생이 실제로 질문하고 이해하며 꾸준히 학습할 수 있는 환경인지까지 확인해보는 것이 좋습니다.';

    // 본문은 운영 기준상 1,800~2,000자 내외로 고정합니다.
    // 선택값에 따라 길이가 조금 달라질 수 있어 부족하면 자연스러운 마무리 문단을 추가합니다.
    var plainLength = body.replace(/[#*`\n]/g, '').length;
    if (plainLength < 1800) {
      body += '\n\n## 꾸준한 점검이 성적 변화를 만듭니다\n\n' +
        '학습은 한 번의 설명이나 한 번의 시험으로 끝나지 않습니다. 매주 이해한 내용과 아직 어려운 내용을 확인하고 다음 학습에 반영해야 합니다. 작은 실수라도 반복된다면 원인을 찾아 수정하고, 잘하는 부분은 적절한 난도의 문제로 확장해 자신감을 유지하는 것이 좋습니다. 학생이 자신의 학습 상태를 이해하고 스스로 공부하는 힘을 키울 수 있도록 수업과 관리가 함께 이어지는지 확인해보세요.';
    }
    return body;
  }

  function makeData(v) {
    var place = (v.region + ' ' + v.subregion).trim().replace(/\s+/g, ' ');
    var points = v.points.length ? v.points.join(', ') : '소수정예, 개별 학습관리';
    var title = place + ' ' + v.target + ' ' + v.subject + '학원, ' + v.topic;

    return {
      slug: makeSlug(v.region, v.subregion, v.target, v.subject, v.topic),
      title: title,
      date: new Date().toISOString().slice(0, 10),
      region: place,
      target: v.target,
      category: v.subject,
      excerpt: topicIntro(v, place, points),
      answer: v.target + ' ' + v.subject + ' 학습에서는 진도만 빠르게 나가기보다 현재 이해도를 확인하고 질문, 피드백, 오답관리, 시험 대비가 한 흐름으로 이어지는지 살펴보는 것이 중요합니다. WAWA는 소수정예 환경에서 학생별 학습 상태를 확인하고 필요한 부분을 반복 관리하는 방식을 지향합니다.',
      imageAlt: title + ' 관련 학생 학습 장면',
      body: buildBody(v, place, points),
      q1: place + ' ' + v.target + ' ' + v.subject + '학원을 선택할 때 가장 먼저 볼 것은 무엇인가요?',
      a1: '학생의 현재 수준을 어떻게 진단하는지, 개별 진도와 질문·피드백, 오답관리가 실제 수업에서 어떻게 이루어지는지 확인하는 것이 좋습니다.',
      q2: '소수정예 수업에서는 어떤 점을 확인해야 하나요?',
      a2: '학생 수가 적다는 사실보다 학생별 이해도와 학습 속도를 실제로 확인하고 필요한 피드백을 연결하는 운영 방식인지 살펴보는 것이 중요합니다.',
      q3: 'WAWA 센터 상담은 어떻게 신청하나요?',
      a3: '홈페이지에서 지역명, 센터명 또는 학교명으로 가까운 센터를 검색한 뒤 전화 또는 네이버폼을 통해 상담을 신청할 수 있습니다.'
    };
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function findItemRoot(node) {
    var p = node;
    var fallback = null;
    for (var i = 0; i < 80 && p; i++, p = p.parentElement) {
      if (!p.querySelectorAll) continue;
      var fields = p.querySelectorAll('[data-wawa-field]');
      var helpers = p.querySelectorAll('[data-wawa-helper="1"]');
      if (!fallback && fields.length >= 5) fallback = p;
      if (helpers.length === 1 && fields.length >= 5) return p;
    }
    return fallback || document.body;
  }

  function applyPayload(helperNode, payload) {
    var root = findItemRoot(helperNode);
    var applied = 0;

    // 1차: 현재 펼쳐진 포스팅 항목 안의 필드만 갱신
    REGISTRY.slice().forEach(function (instance) {
      if (!instance || !instance._wrap) return;
      if (root !== document.body && !root.contains(instance._wrap)) return;
      if (!isVisible(instance._wrap)) return;
      if (instance.applyAutofill(payload)) applied += 1;
    });

    // Decap list 위젯의 DOM 깊이가 버전/화면 크기에 따라 달라져 root 탐색이 실패하는 경우가 있습니다.
    // 이때는 화면에 현재 보이는(=펼쳐진) WAWA 필드만 대상으로 한 번 더 적용합니다.
    if (applied < 5) {
      applied = 0;
      REGISTRY.slice().forEach(function (instance) {
        if (!instance || !instance._wrap || !isVisible(instance._wrap)) return;
        if (instance.applyAutofill(payload)) applied += 1;
      });
    }

    return applied;
  }

  var Control = createClass({
    getInitialState: function () {
      return {
        region: '부산',
        district: '동래구',
        neighborhood: '온천동',
        target: '중학생',
        subject: '수학',
        topic: '학원 선택 전 확인할 5가지',
        points: ['소수정예', '개별 진도', '오답관리', '내신대비'],
        msg: ''
      };
    },

    set: function (key, event) {
      var next = {};
      next[key] = event.target.value;
      if (key === 'region') {
        var districts = Object.keys(LOCATION_OPTIONS[next.region] || {});
        next.district = districts[0] || '';
        next.neighborhood = next.district ? ((LOCATION_OPTIONS[next.region][next.district] || [])[0] || '') : '';
      } else if (key === 'district') {
        next.neighborhood = ((LOCATION_OPTIONS[this.state.region] || {})[next.district] || [])[0] || '';
      }
      this.setState(next);
    },

    toggle: function (point) {
      var points = this.state.points.slice();
      var index = points.indexOf(point);
      if (index >= 0) points.splice(index, 1);
      else points.push(point);
      this.setState({ points: points });
    },

    fill: function (event) {
      event.preventDefault();
      var s = this.state;
      var input = {}; Object.keys(s).forEach(function(k){ input[k]=s[k]; });
      input.subregion = [s.district, s.neighborhood].filter(Boolean).join(' ');
      if (!s.region || !s.district || !s.neighborhood || !s.target || !s.subject || !s.topic) {
        this.setState({ msg: '시·도, 시·군·구, 동·센터지역, 대상·과목·주제를 선택해주세요.' });
        return;
      }

      var payload = makeData(input);

      // 가장 중요한 저장 안전장치:
      // 자동작성 결과 전체를 이 포스팅 항목의 _helper 값에도 JSON으로 저장합니다.
      // 왼쪽 화면 갱신과 별개로 Decap이 실제 posts.json에 값을 남길 수 있게 합니다.
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(JSON.stringify(payload));
      }

      var applied = applyPayload(this._root, payload);

      this.setState({
        msg: applied >= 5
          ? '자동 입력 완료! ' + applied + '개 필드를 채웠습니다. 대표 이미지만 직접 업로드한 뒤 게시하세요.'
          : '자동 입력에 실패했습니다. 현재 화면의 필드 연결을 확인해주세요. (적용 필드: ' + applied + '개)'
      });
    },

    render: function () {
      var self = this;
      var select = function (key, items) {
        return h(
          'select',
          {
            value: self.state[key],
            onChange: self.set.bind(self, key),
            style: {
              padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px',
              marginRight: '7px', marginBottom: '7px'
            }
          },
          items.map(function (x) { return h('option', { key: x, value: x }, x); })
        );
      };

      return h(
        'div',
        {
          ref: function (el) { self._root = el; },
          'data-wawa-helper': '1',
          style: { padding: '16px', border: '2px solid #2684ff', borderRadius: '12px', background: '#f5f9ff' }
        },
        h('b', { style: { display: 'block', fontSize: '16px', marginBottom: '10px' } }, '✨ WAWA 포스팅 자동 작성'),
        select('region', Object.keys(LOCATION_OPTIONS)),
        select('district', Object.keys(LOCATION_OPTIONS[this.state.region] || {})),
        select('neighborhood', ((LOCATION_OPTIONS[this.state.region] || {})[this.state.district] || [])),
        select('target', ['초등학생', '중학생', '고등학생', '초중등', '중고등', '초중고']),
        select('subject', ['국어', '영어', '수학', '과학', '사회', '국영수', '전과목']),
        select('topic', ['학원 선택 전 확인할 5가지', '성적이 오르지 않는 이유와 공부법', '내신 대비 공부방법', '시험 전 4주 학습계획', '기초가 부족한 학생 공부방법', '오답관리 제대로 하는 방법', '학습 습관 만드는 방법', '소수정예 학원의 장점', '개별진도 수업이 필요한 이유', '학부모가 학원 선택 전 확인할 것']),
        h(
          'div',
          { style: { margin: '5px 0 10px' } },
          ['소수정예', '개별 진도', '오답관리', '내신대비', '질문과 피드백', '학습 습관 관리'].map(function (x) {
            var on = self.state.points.indexOf(x) >= 0;
            return h('button', {
              type: 'button', key: x, onClick: self.toggle.bind(self, x),
              style: {
                padding: '8px 11px', margin: '3px', borderRadius: '18px', border: '1px solid #2684ff',
                background: on ? '#2684ff' : 'white', color: on ? 'white' : '#1456a0', cursor: 'pointer'
              }
            }, x);
          })
        ),
        h('button', {
          type: 'button', onClick: this.fill.bind(this),
          style: { padding: '11px 16px', border: 0, borderRadius: '9px', background: '#1677ff', color: 'white', fontWeight: '700', cursor: 'pointer' }
        }, '✨ 포스팅 초안 자동 채우기'),
        h('div', { style: { marginTop: '8px', fontSize: '12px', color: '#64748b' } }, '※ 대표 이미지 파일은 자동 생성되지 않습니다. 주제에 맞는 이미지를 업로드하면 이미지 설명은 자동으로 채워집니다.'),
        this.state.msg ? h('div', { style: { marginTop: '9px', color: '#31557e', fontWeight: '600' } }, this.state.msg) : null
      );
    }
  });

  CMS.registerWidget('wawa_autofill', Control);

  // 폴더형 컬렉션: 한 게시글 = 한 JSON 파일.
  // 중첩 list를 제거했기 때문에 자동작성 값이 Decap의 실제 저장 데이터와 1:1로 연결됩니다.
  if (CMS.registerEventListener) {
    CMS.registerEventListener({
      name: 'preSave',
      handler: function (args) {
        var entry = args && args.entry;
        if (!entry || !entry.get) return;
        var data = entry.get('data');
        if (!data || !data.get) return data;
        var raw = data.get('_helper');
        if (!raw) return data;
        var payload = null;
        try { payload = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { payload = null; }
        if (!payload || typeof payload !== 'object') return data;
        var next = data;
        Object.keys(payload).forEach(function (key) {
          var current = next.get ? next.get(key) : undefined;
          if ((current === undefined || current === null || current === '') && payload[key] !== undefined && payload[key] !== null) {
            next = next.set(key, payload[key]);
          }
        });
        return next;
      }
    });
  }

  function previewPostFromData(data) {
    var p = data && data.toJS ? data.toJS() : (data || {});
    if (p._helper) {
      try {
        var helper = typeof p._helper === 'string' ? JSON.parse(p._helper) : p._helper;
        if (helper && typeof helper === 'object') p = Object.assign({}, helper, p);
      } catch (e) {}
    }
    return p || {};
  }

  function previewParagraphs(body) {
    var lines = String(body || '').split(/\n+/).filter(Boolean);
    return lines.map(function(line, i) {
      if (line.indexOf('## ') === 0) return h('h2', {key:'h'+i, style:{fontSize:'27px',margin:'38px 0 12px',color:'#082a60'}}, line.slice(3));
      return h('p', {key:'p'+i, style:{fontSize:'16px',lineHeight:'1.85',color:'#344d70',margin:'0 0 15px'}}, line.replace(/^#\s*/,''));
    });
  }

  var WawaPreview = createClass({
    render: function() {
      var p = previewPostFromData(this.props.entry && this.props.entry.getIn ? this.props.entry.getIn(['data']) : null);
      var image = p.image;
      try { if (image && this.props.getAsset) image = this.props.getAsset(image).toString(); } catch(e) {}
      var detail = p.detailImage;
      try { if (detail && this.props.getAsset) detail = this.props.getAsset(detail).toString(); } catch(e) {}
      var body = previewParagraphs(p.body);
      var detailNode = detail ? h('img',{src:detail,alt:p.detailImageAlt||p.title||'',style:{width:'100%',height:'auto',display:'block',borderRadius:'16px',margin:'28px 0'}}) : null;
      if (detailNode) {
        if (p.detailImagePosition === 'top') body.unshift(detailNode);
        else if (p.detailImagePosition === 'bottom') body.push(detailNode);
        else body.splice(Math.max(1,Math.ceil(body.length/2)),0,detailNode);
      }
      return h('div',{style:{fontFamily:'Pretendard, Noto Sans KR, Arial, sans-serif',background:'#fff',color:'#12284b',minHeight:'100vh'}},
        h('main',{style:{maxWidth:'860px',margin:'0 auto',padding:'42px 28px'}},
          h('div',{style:{fontSize:'13px',color:'#6b7f99',marginBottom:'18px'}},'홈  >  교육정보  >  '+(p.title||'새 포스팅')),
          h('span',{style:{display:'inline-block',padding:'6px 11px',borderRadius:'999px',background:'#eaf5ff',color:'#247cf2',fontWeight:'800'}},p.category||'교육정보'),
          h('h1',{style:{fontSize:'36px',lineHeight:'1.28',letterSpacing:'-0.04em',margin:'14px 0'}},p.title||'자동 작성 후 제목이 표시됩니다.'),
          h('div',{style:{color:'#73869e',marginBottom:'24px'}},[p.date,p.region,p.target].filter(Boolean).join('  ·  ')),
          image ? h('img',{src:image,alt:p.imageAlt||p.title||'',style:{width:'100%',height:'auto',display:'block',borderRadius:'18px',margin:'0 0 24px'}}) : h('div',{style:{padding:'46px 20px',background:'#f4f8fd',borderRadius:'18px',textAlign:'center',color:'#8293a8',marginBottom:'24px'}},'대표 이미지를 업로드하면 여기에 표시됩니다.'),
          h('section',{style:{background:'#eef7ff',border:'1px solid #d6eaff',borderRadius:'16px',padding:'20px 22px',margin:'0 0 30px'}},
            h('b',{style:{display:'block',fontSize:'18px',marginBottom:'6px'}},'한눈에 답하기'),
            h('div',{style:{lineHeight:'1.75',color:'#344d70'}},p.answer||p.excerpt||'자동 작성 후 핵심답변이 표시됩니다.')
          ),
          h('article',null,body),
          (p.q1||p.q2||p.q3) ? h('section',{style:{marginTop:'45px'}},h('h2',{style:{fontSize:'27px'}},'자주 묻는 질문'),[1,2,3].map(function(n){return p['q'+n]&&p['a'+n]?h('div',{key:n,style:{padding:'17px 0',borderTop:'1px solid #dce8f7'}},h('b',null,p['q'+n]),h('p',{style:{lineHeight:'1.7',color:'#526984'}},p['a'+n])):null;})) : null
        )
      );
    }
  });
  CMS.registerPreviewTemplate('education_posts', WawaPreview);

})();
