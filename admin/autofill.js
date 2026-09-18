(function(){
  function setNative(el,value){
    if(!el)return false;
    var proto = el.tagName==='TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName==='SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    var d=Object.getOwnPropertyDescriptor(proto,'value');
    if(d&&d.set)d.set.call(el,value); else el.value=value;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }
  function visible(el){var r=el.getBoundingClientRect();return r.width>0&&r.height>0}
  function fieldIn(scope,labelText){
    var labels=[].slice.call(scope.querySelectorAll('label'));
    var lab=labels.find(function(l){return visible(l)&&l.textContent.trim().indexOf(labelText)===0});
    if(!lab)return null;
    var box=lab.parentElement;
    for(var i=0;i<5&&box;i++,box=box.parentElement){
      var el=box.querySelector('input:not([type=hidden]), textarea, select');
      if(el&&visible(el))return el;
    }
    return null;
  }
  function scopeFrom(node){
    var p=node;
    for(var i=0;i<12&&p;i++,p=p.parentElement){
      if(p.querySelectorAll&&p.querySelectorAll('label').length>=8&&fieldIn(p,'주소용 영문 이름')&&fieldIn(p,'제목')) return p;
    }
    return document;
  }
  var eng={서울:'seoul',부산:'busan',대구:'daegu',인천:'incheon',광주:'gwangju',대전:'daejeon',울산:'ulsan',세종:'sejong',경기:'gyeonggi',강원:'gangwon',충북:'chungbuk',충남:'chungnam',전북:'jeonbuk',전남:'jeonnam',경북:'gyeongbuk',경남:'gyeongnam',제주:'jeju',초등학생:'elementary',중학생:'middle',고등학생:'high',초중등:'elem-middle',중고등:'middle-high',초중고:'all-grades',국어:'korean',영어:'english',수학:'math',과학:'science',사회:'social',국영수:'kem',전과목:'all-subjects'};
  function slug(region,target,subject){var a=[];Object.keys(eng).forEach(function(k){if(region.indexOf(k)>=0&&!a.includes(eng[k]))a.push(eng[k])});[target,subject].forEach(function(x){if(eng[x]&&!a.includes(eng[x]))a.push(eng[x])});a.push('academy-guide');return a.join('-')}
  function data(v){
    var r=(v.region+' '+v.subregion).trim().replace(/\s+/g,' '), p=v.points.join(', ');
    return {
      slug:slug(r,v.target,v.subject), title:r+' '+v.target+' '+v.subject+'학원, '+v.topic, date:new Date().toISOString().slice(0,10), region:r, target:v.target, category:v.subject,
      excerpt:r+'에서 '+v.target+' '+v.subject+'학원을 알아보는 학부모를 위해 수업 방식과 학습관리에서 확인할 기준을 정리했습니다. WAWA의 '+p+' 운영 방식도 함께 살펴봅니다.',
      answer:v.target+' '+v.subject+'학원을 선택할 때는 진도 속도만 보기보다 학생이 질문하고 피드백받는 과정, 개별 학습관리와 오답관리가 실제로 이루어지는지 확인하는 것이 중요합니다. WAWA는 소수정예 환경에서 학생별 학습 상태를 확인하고 필요한 부분을 반복 관리하는 방식으로 수업을 진행합니다.',
      body:'## '+r+' '+v.target+' '+v.subject+'학원, 무엇을 먼저 확인해야 할까요?\n\n'+r+'에서 '+v.target+' '+v.subject+'학원을 찾을 때 단순히 유명한 학원인지보다 우리 아이의 현재 학습 상태를 세밀하게 확인하고 관리할 수 있는지 살펴보는 것이 좋습니다. 같은 학년이라도 개념 이해도와 문제풀이 속도, 취약 단원이 다르기 때문입니다.\n\n## 1. 학생별 진도와 이해도를 확인하는 수업\n\nWAWA는 소수정예 수업을 바탕으로 학생의 현재 수준과 학습 속도를 확인하며 수업을 진행합니다. 이해가 부족한 부분은 다시 확인하고, 충분히 이해한 내용은 다음 단계로 연결해 학습의 흐름이 끊기지 않도록 관리합니다.\n\n## 2. 질문과 피드백이 바로 이어지는 환경\n\n수업 중 모르는 내용을 그대로 넘기지 않고 질문하고 확인하는 과정이 중요합니다. 학생이 어느 단계에서 막혔는지를 파악하고 필요한 설명과 문제를 다시 연결하면 단순 암기보다 개념 이해에 도움이 됩니다.\n\n## 3. 오답관리와 내신 대비\n\n틀린 문제는 정답만 확인하기보다 왜 틀렸는지 원인을 구분하는 과정이 필요합니다. 개념 부족, 계산 실수, 문제 해석 오류 등을 확인하고 비슷한 유형을 다시 풀어보며 시험 전에 취약 부분을 점검합니다.\n\n## 4. '+p+'\n\nWAWA는 학생 한 명 한 명의 학습 과정을 살펴볼 수 있도록 소수정예 방식의 학습관리를 지향합니다. 학원 선택 전에는 가까운 WAWA 센터의 실제 운영 과목과 학습관리 방식도 상담을 통해 확인해보세요.\n\n## 5. 학원 선택 전 마지막으로 확인할 점\n\n상담할 때는 현재 성적만 전달하기보다 어려워하는 단원, 공부 습관, 시험 준비 방식까지 함께 이야기하는 것이 좋습니다. 학생에게 필요한 관리 방식이 무엇인지 구체적으로 확인하면 학원 선택에 도움이 됩니다.',
      q1:r+' '+v.target+' '+v.subject+'학원을 선택할 때 가장 먼저 볼 것은 무엇인가요?', a1:'학생의 현재 수준을 진단하고 개별 진도, 질문과 피드백, 오답관리가 실제 수업에서 어떻게 이루어지는지 확인하는 것이 좋습니다.',
      q2:'소수정예 수업의 특징은 무엇인가요?', a2:'한 수업에서 학생별 이해도와 학습 속도를 비교적 세밀하게 확인하고 필요한 부분에 피드백을 연결하기 좋다는 점이 특징입니다.',
      q3:'WAWA 센터 상담은 어떻게 신청하나요?', a3:'홈페이지에서 가까운 센터를 검색한 뒤 전화 또는 네이버폼을 통해 상담을 신청할 수 있습니다.'
    };
  }
  var Control=createClass({
    getInitialState:function(){return {region:'부산',subregion:'동래구',target:'중학생',subject:'수학',topic:'학원 선택 전 확인할 5가지',points:['소수정예','개별 진도','오답관리','내신대비'],msg:''}},
    set:function(k,e){var o={};o[k]=e.target.value;this.setState(o)},
    toggle:function(x){var a=this.state.points.slice(),i=a.indexOf(x);if(i>=0)a.splice(i,1);else a.push(x);this.setState({points:a})},
    fill:function(e){e.preventDefault();var s=this.state;if(!s.region||!s.subregion||!s.target||!s.subject||!s.topic){this.setState({msg:'지역·대상·과목·주제를 선택해주세요.'});return}var root=scopeFrom(e.currentTarget),d=data(s),map={'주소용 영문 이름':'slug','제목':'title','작성일':'date','지역':'region','대상':'target','카테고리':'category','검색결과·목록 요약':'excerpt','AI 검색 핵심답변':'answer','본문':'body','FAQ 질문 1':'q1','FAQ 답변 1':'a1','FAQ 질문 2':'q2','FAQ 답변 2':'a2','FAQ 질문 3':'q3','FAQ 답변 3':'a3'},n=0;Object.keys(map).forEach(function(label){if(setNative(fieldIn(root,label),d[map[label]]))n++});this.props.onChange('자동작성 완료: '+new Date().toLocaleString('ko-KR'));this.setState({msg:n+'개 항목을 자동으로 채웠습니다. 내용을 확인한 뒤 게시하세요.'})},
    render:function(){var self=this,sel=function(k,arr){return h('select',{value:self.state[k],onChange:self.set.bind(self,k),style:{padding:'10px',border:'1px solid #cbd5e1',borderRadius:'8px',marginRight:'7px',marginBottom:'7px'}},arr.map(function(x){return h('option',{key:x,value:x},x)}))};return h('div',{style:{padding:'16px',border:'2px solid #2684ff',borderRadius:'12px',background:'#f5f9ff'}},h('b',{style:{display:'block',fontSize:'16px',marginBottom:'10px'}},'✨ WAWA 포스팅 자동 작성'),sel('region',['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주']),h('input',{value:this.state.subregion,onChange:this.set.bind(this,'subregion'),placeholder:'구·동 (예: 동래구)',style:{padding:'10px',border:'1px solid #cbd5e1',borderRadius:'8px',marginRight:'7px',marginBottom:'7px',width:'150px'}}),sel('target',['초등학생','중학생','고등학생','초중등','중고등','초중고']),sel('subject',['국어','영어','수학','과학','사회','국영수','전과목']),sel('topic',['학원 선택 전 확인할 5가지','성적이 오르지 않는 이유와 공부법','내신 대비 공부방법','시험 전 4주 학습계획','기초가 부족한 학생 공부방법','오답관리 제대로 하는 방법','학습 습관 만드는 방법','소수정예 학원의 장점','개별진도 수업이 필요한 이유','학부모가 학원 선택 전 확인할 것']),h('div',{style:{margin:'5px 0 10px'}},['소수정예','개별 진도','오답관리','내신대비','질문과 피드백','학습 습관 관리'].map(function(x){var on=self.state.points.indexOf(x)>=0;return h('button',{type:'button',key:x,onClick:self.toggle.bind(self,x),style:{padding:'8px 11px',margin:'3px',borderRadius:'18px',border:'1px solid #2684ff',background:on?'#2684ff':'white',color:on?'white':'#1456a0'}},x)})),h('button',{type:'button',onClick:this.fill.bind(this),style:{padding:'11px 16px',border:0,borderRadius:'9px',background:'#1677ff',color:'white',fontWeight:'700',cursor:'pointer'}},'✨ 포스팅 초안 자동 채우기'),this.state.msg?h('div',{style:{marginTop:'9px',color:'#31557e'}},this.state.msg):null)}
  });
  CMS.registerWidget('wawa_autofill',Control);
})();
