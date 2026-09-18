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
      componentDidMount: function () {
        REGISTRY.push(this);
      },

      componentWillUnmount: function () {
        var i = REGISTRY.indexOf(this);
        if (i >= 0) REGISTRY.splice(i, 1);
      },

      applyAutofill: function (data) {
        if (!data) return false;
        var name = fieldName(this.props);
        if (!name || !Object.prototype.hasOwnProperty.call(data, name)) return false;
        if (typeof this.props.onChange !== 'function') return false;
        this.props.onChange(data[name]);
        return true;
      },

      render: function () {
        var self = this;
        return h(
          'div',
          {
            ref: function (el) { self._wrap = el; },
            'data-wawa-field': fieldName(this.props)
          },
          h(BaseControl, this.props)
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
    var topicSection = {
      '학원 선택 전 확인할 5가지': '학원을 고를 때는 단순히 학생 수나 진도 속도만 보기보다 현재 수준을 어떻게 진단하고, 수업 중 질문과 피드백이 얼마나 빠르게 이어지는지 확인하는 것이 중요합니다.',
      '성적이 오르지 않는 이유와 공부법': '성적이 오르지 않을 때는 공부량만 늘리기보다 개념 이해, 문제 적용, 오답 원인, 시험 전 복습 과정 중 어디에서 막히는지 먼저 찾아야 합니다.',
      '내신 대비 공부방법': '내신 대비는 시험 직전 문제풀이만으로 완성되기 어렵습니다. 학교 진도에 맞춰 개념을 정리하고, 학교별 자주 출제되는 유형을 연습한 뒤 오답을 다시 확인하는 흐름이 필요합니다.',
      '시험 전 4주 학습계획': '시험 4주 전에는 범위를 확인하고 개념을 정리한 뒤, 3주 전 유형 연습, 2주 전 취약 단원 보완, 마지막 1주 실전 점검으로 이어가는 방식이 효율적입니다.',
      '기초가 부족한 학생 공부방법': '기초가 부족한 학생은 어려운 문제를 많이 푸는 것보다 현재 학년에서 꼭 필요한 핵심 개념을 다시 확인하고 작은 성공 경험을 쌓는 과정이 먼저입니다.',
      '오답관리 제대로 하는 방법': '오답관리는 정답을 베끼는 일이 아니라 틀린 이유를 구분하는 과정입니다. 개념 부족인지, 문제 해석 오류인지, 계산 실수인지 확인한 뒤 비슷한 유형을 다시 풀어야 합니다.',
      '학습 습관 만드는 방법': '학습 습관은 긴 공부시간보다 일정한 시작 시간과 작은 분량을 꾸준히 지키는 데서 만들어집니다. 매일 확인 가능한 목표를 정하고 완료 여부를 점검하는 것이 좋습니다.',
      '소수정예 학원의 장점': '소수정예 수업의 핵심은 단순히 학생 수가 적다는 데 있지 않습니다. 학생별 이해도와 진도를 확인하고 필요한 설명과 문제를 바로 연결할 수 있는지가 중요합니다.',
      '개별진도 수업이 필요한 이유': '같은 학년이라도 학생마다 강한 단원과 취약 단원이 다릅니다. 개별진도는 현재 이해도를 기준으로 필요한 부분을 보완하면서 다음 단계로 넘어가기 위한 방식입니다.',
      '학부모가 학원 선택 전 확인할 것': '학원 상담에서는 수업 시간과 비용뿐 아니라 학생 수준을 어떻게 진단하는지, 숙제와 오답을 어떻게 관리하는지, 시험 대비가 어떤 순서로 진행되는지 확인하는 것이 좋습니다.'
    }[v.topic];

    return '## ' + place + ' ' + v.target + ' ' + v.subject + ', ' + v.topic + '\n\n' +
      topicSection + '\n\n' +
      '## 1. 현재 수준부터 정확히 확인하세요\n\n' +
      '같은 학년이라도 개념 이해도와 문제풀이 속도, 취약 단원은 다를 수 있습니다. 처음부터 빠른 진도를 목표로 하기보다 현재 어디에서 막히는지 확인하고 필요한 부분부터 보완하는 과정이 중요합니다.\n\n' +
      '## 2. 질문과 피드백이 수업 안에서 이어져야 합니다\n\n' +
      '모르는 내용을 그대로 넘기지 않고 질문하고 확인하는 과정이 필요합니다. 학생이 어느 단계에서 어려움을 느끼는지 파악한 뒤 설명과 문제를 다시 연결하면 단순 암기보다 개념 이해에 도움이 됩니다.\n\n' +
      '## 3. 오답관리는 틀린 이유를 찾는 과정입니다\n\n' +
      '틀린 문제는 정답만 확인하기보다 개념 부족, 계산 실수, 문제 해석 오류 등 원인을 구분해야 합니다. 이후 비슷한 유형을 다시 풀어보며 같은 실수가 반복되지 않는지 확인하는 것이 좋습니다.\n\n' +
      '## 4. 내신 대비는 평소 학습과 연결되어야 합니다\n\n' +
      '시험 직전에 문제를 몰아서 푸는 것보다 학교 진도에 맞춰 개념과 유형을 정리하고, 시험 전에는 취약 단원과 오답을 다시 확인하는 흐름이 안정적입니다.\n\n' +
      '## 5. WAWA의 학습관리 방식\n\n' +
      'WAWA는 ' + points + '을 중심으로 학생 한 명 한 명의 학습 과정을 살펴보는 소수정예 학습관리를 지향합니다. 센터마다 운영 과목과 세부 방식은 다를 수 있으므로 가까운 센터에서 현재 학습 상황을 상담해보는 것이 좋습니다.\n\n' +
      '## 상담 전 확인하면 좋은 내용\n\n' +
      '현재 성적뿐 아니라 어려워하는 단원, 평소 공부시간, 숙제 습관, 최근 시험에서 자주 틀리는 유형까지 함께 정리해 상담하면 학생에게 필요한 학습 방향을 더 구체적으로 확인할 수 있습니다.';
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
        subregion: '동래구',
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
      if (!s.region || !s.subregion || !s.target || !s.subject || !s.topic) {
        this.setState({ msg: '지역·대상·과목·주제를 선택해주세요.' });
        return;
      }

      var payload = makeData(s);
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
        select('region', ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']),
        h('input', {
          value: this.state.subregion,
          onChange: this.set.bind(this, 'subregion'),
          placeholder: '구·동 (예: 동래구)',
          style: { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginRight: '7px', marginBottom: '7px', width: '150px' }
        }),
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
})();
