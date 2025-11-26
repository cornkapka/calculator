// 四川移动集客奖金计算器脚本

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const levelSelect = document.getElementById('level-select');
    const employeeTypeSelect = document.getElementById('employee-sequence');
    const zhankejingliInputs = document.getElementById('zhankejingli-inputs');
    const wgskInputs = document.getElementById('wgsk-inputs');
    const jfzxInputs = document.getElementById('jfzx-inputs');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    // 新增：规则提示与主任人数元素
    const ruleTips = document.getElementById('rule-tips');
    const ruleTipsContent = document.getElementById('rule-tips-content');
    const jfzxPeopleRow = document.getElementById('jfzx-people-row');
    const jfzxPeopleCountInput = document.getElementById('jfzx-people-count');
    const capacityOnlyInputs = document.getElementById('capacity-only-inputs');
    const zhankeDirectorInputs = document.getElementById('zhanke-director-inputs');

    // 根据圈层/属性映射可选序列
    const levelToSequences = {
        'layer-1': [
            { value: 'zhankejingli', label: '战客客户经理' },
            { value: 'shangkejingli', label: '商客客户经理' },
            { value: 'jiejuefangan', label: '解决方案经理' },
            { value: 'zhankejingli-zhuren', label: '战客中心主任' },
            { value: 'shangkejingli-zhuren', label: '商客中心主任' },
            { value: 'wanggejingli', label: '网格客户经理(重属性)' },
            { value: 'wanggejingli-zhong', label: '网格客户经理(中属性)' },
            { value: 'wanggejingli-ruo', label: '网格客户经理(弱属性)' },
            { value: 'zonghe-zhong-zhong', label: '综合服务中心主任(重属性)' },
            { value: 'zonghe-zhong', label: '综合服务中心主任(中属性)' },
            { value: 'zonghe-zhong-ruo', label: '综合服务中心主任(弱属性)' }
        ],
        'layer-2': [
            { value: 'zhankejingli', label: '战客客户经理' },
            { value: 'shangkejingli', label: '商客客户经理' },
            { value: 'jiejuefangan', label: '解决方案经理' },
            { value: 'zhankejingli-zhuren', label: '战客中心主任' },
            { value: 'shangkejingli-zhuren', label: '商客中心主任' },
            { value: 'wanggejingli', label: '网格客户经理(重属性)' },
            { value: 'wanggejingli-zhong', label: '网格客户经理(中属性)' },
            { value: 'wanggejingli-ruo', label: '网格客户经理(弱属性)' },
            { value: 'zonghe-zhong-zhong', label: '综合服务中心主任(重属性)' },
            { value: 'zonghe-zhong', label: '综合服务中心主任(中属性)' },
            { value: 'zonghe-zhong-ruo', label: '综合服务中心主任(弱属性)' }
        ],
        'layer-3': [
            { value: 'zhankejingli', label: '战客客户经理' },
            { value: 'shangkejingli', label: '商客客户经理' },
            { value: 'jiejuefangan', label: '解决方案经理' },
            { value: 'zhankejingli-zhuren', label: '战客中心主任' },
            { value: 'shangkejingli-zhuren', label: '商客中心主任' },
            { value: 'wanggejingli', label: '网格客户经理(重属性)' },
            { value: 'wanggejingli-zhong', label: '网格客户经理(中属性)' },
            { value: 'wanggejingli-ruo', label: '网格客户经理(弱属性)' },
            { value: 'zonghe-zhong-zhong', label: '综合服务中心主任(重属性)' },
            { value: 'zonghe-zhong', label: '综合服务中心主任(中属性)' },
            { value: 'zonghe-zhong-ruo', label: '综合服务中心主任(弱属性)' }
        ]
    };

    function populateSequences(levelKey) {
        // 清空并重置序列下拉
        employeeTypeSelect.innerHTML = '';
        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = '请选择...';
        employeeTypeSelect.appendChild(optDefault);
        const list = levelToSequences[levelKey] || [];
        list.forEach(({ value, label }) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            employeeTypeSelect.appendChild(opt);
        });
        employeeTypeSelect.disabled = list.length === 0;
    }

    // ===== 新增：加载奖金规则 =====
    let bonusRules = null;
    let activeRules = null;
    // 规则未加载前先禁用按钮，避免误点
    calculateBtn.disabled = true;
    fetch('bonus_rules.json')
        .then(res => res.json())
        .then(data => {
            bonusRules = data;
            calculateBtn.disabled = false;
        })
        .catch(err => {
            console.error('Failed to load bonus rules', err);
            alert('奖金规则文件加载失败，请联系管理员！');
        });
    
    // 监听圈层/属性选择变化，刷新序列下拉并隐藏所有输入区
    if (levelSelect) {
        levelSelect.addEventListener('change', function() {
            const levelKey = this.value;
            populateSequences(levelKey);
            zhankejingliInputs.classList.add('hidden');
            wgskInputs.classList.add('hidden');
            // jfzxInputs.classList.add('hidden');
            if (capacityOnlyInputs) capacityOnlyInputs.classList.add('hidden');
            if (zhankeDirectorInputs) zhankeDirectorInputs.classList.add('hidden');
            resultDiv.classList.add('hidden');
            // 重置主任人数行隐藏与默认值
            if (jfzxPeopleRow) jfzxPeopleRow.classList.add('hidden');
            if (jfzxPeopleCountInput) jfzxPeopleCountInput.value = 1;
            // 设定当前圈层规则
            activeRules = bonusRules?.layers?.[levelKey] || null;
            // 已移除规则提示区块，不再显示
            if (ruleTips) {
                ruleTips.classList.add('hidden');
                if (ruleTipsContent) ruleTipsContent.innerHTML = '';
            }
        });
    }

    // 监听员工序列选择变化
    if (employeeTypeSelect) {
        employeeTypeSelect.addEventListener('change', function() {
            // 隐藏所有输入区域
            zhankejingliInputs.classList.add('hidden');
            wgskInputs.classList.add('hidden');
            // jfzxInputs.classList.add('hidden');
            if (capacityOnlyInputs) capacityOnlyInputs.classList.add('hidden');
            if (zhankeDirectorInputs) zhankeDirectorInputs.classList.add('hidden');
            resultDiv.classList.add('hidden');
            if (ruleTips) ruleTips.classList.add('hidden');
            if (ruleTipsContent) ruleTipsContent.innerHTML = '';
            
            // 根据选择显示对应输入区域
            const selectedValue = this.value;
            const levelKey = levelSelect ? levelSelect.value : '';
            if (selectedValue === 'zhankejingli') {
                zhankejingliInputs.classList.remove('hidden');
            } else if (selectedValue === 'shangkejingli' || selectedValue === 'wanggejingli' || selectedValue === 'wanggejingli-zhong' || selectedValue === 'wanggejingli-ruo') {
                wgskInputs.classList.remove('hidden');
            } else if (selectedValue === 'zhankejingli-zhuren') {
                if (zhankeDirectorInputs) zhankeDirectorInputs.classList.remove('hidden');
            } else if (selectedValue === 'jiejuefangan' || selectedValue === 'shangkejingli-zhuren' || selectedValue === 'zonghe-zhong' || selectedValue === 'zonghe-zhong-zhong' || selectedValue === 'zonghe-zhong-ruo') {
                if (capacityOnlyInputs) capacityOnlyInputs.classList.remove('hidden');
            }
            // 战客中心主任需人数输入
            if (jfzxPeopleRow) {
                if (selectedValue === 'zhankejingli-zhuren') {
                    jfzxPeopleRow.classList.remove('hidden');
                } else {
                    jfzxPeopleRow.classList.add('hidden');
                }
            }
            // 规则提示已删除，不再更新
        });
    }
 
    // 木本业务赛道输入ID列表
    const zkMubenInputs = [
        'zk-muben-zhuanxian', 'zk-muben-yunmas', 'zk-muben-yunyewu',
        'zk-muben-wulianwang', 'zk-muben-5g', 'zk-muben-jiaoyu'
    ];
 
    // 战客经理其他产能输入ID列表
    const zkOtherInputs = ['zk-zs-xiangmu', 'zk-zs-zhixiao'];
 
    zkMubenInputs.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el) el.addEventListener('input', updateZkMubenTotal);
    });
 
    function updateZkMubenTotal() {
        let total = 0;
        zkMubenInputs.forEach(inputId => {
            total += Number(document.getElementById(inputId).value) || 0;
        });
        document.getElementById('zk-muben-total').textContent = formatMoney(total) + ' 元';
        document.getElementById('zk-zs-muben').value = total;
        updateZkZsTotal();
    }
 
    // 实时计算战客经理增收赛道总产能
    const zkZsXiangmu = document.getElementById('zk-zs-xiangmu');
    if (zkZsXiangmu) zkZsXiangmu.addEventListener('input', updateZkZsTotal);
 
    function updateZkZsTotal() {
        const muben = Number(document.getElementById('zk-zs-muben').value) || 0;
        const xiangmu = Number(document.getElementById('zk-zs-xiangmu').value) || 0;
        const otherTotal = xiangmu;
        const total = muben + otherTotal;
        document.getElementById('zk-zs-other-total').textContent = formatMoney(otherTotal) + ' 元';
        document.getElementById('zk-zs-total').textContent = formatMoney(total) + ' 元';
    }
 
    // 商客/网格客户经理木本业务输入ID列表
    const wgskMubenInputs = [
        'wgsk-gr-zhuanxian', 'wgsk-gr-yunmas', 'wgsk-gr-yunyewu',
        'wgsk-gr-wulianwang', 'wgsk-gr-5g', 'wgsk-gr-jiaoyu'
    ];
 
    // 实时计算网格/商客经理个人增收赛道总产能
    const wgskGrInputs = [
        'wgsk-gr-zhuanxian', 'wgsk-gr-yunmas', 'wgsk-gr-yunyewu',
        'wgsk-gr-wulianwang', 'wgsk-gr-5g', 'wgsk-gr-jiaoyu', 'wgsk-gr-xiangmu'
    ];
 
    wgskGrInputs.forEach(inputId => {
        const el = document.getElementById(inputId);
        if (el) el.addEventListener('input', function() {
            updateWgskTotal();
        });
    });

    const wgskTdJiedui = document.getElementById('wgsk-td-jiedui');
    if (wgskTdJiedui) wgskTdJiedui.addEventListener('input', updateWgskTotal);

    // 初始化显示
    updateWgskTotal();
    
    function updateWgskTotal() {
        // 计算木本业务产能
        let mubenTotal = 0;
        wgskMubenInputs.forEach(inputId => {
            mubenTotal += Number(document.getElementById(inputId).value) || 0;
        });
        const mubenTotalEl = document.getElementById('wgsk-gr-muben-total');
        if (mubenTotalEl) mubenTotalEl.textContent = formatMoney(mubenTotal) + ' 元';
        
        // 计算项目IT产能
        const xiangmuTotal = Number(document.getElementById('wgsk-gr-xiangmu').value) || 0;
        
        // 计算增收赛道总产能（木本+项目IT+直销队）
        const zhixiaoTotal = Number(document.getElementById('wgsk-td-jiedui').value) || 0;
        const tdTotal = mubenTotal + xiangmuTotal + zhixiaoTotal;
        const tdTotalEl = document.getElementById('wgsk-td-total');
        if (tdTotalEl) tdTotalEl.textContent = formatMoney(tdTotal) + ' 元';
    }
     

     
    // 已重构：产能输入改为 capacity-only / zhanke-director 两套UI
    // 旧的 jfzx-capacity 读取逻辑已废弃
    // 新增：通用与战客主任产能输入监听与取值
    const capacityOnlyInput = document.getElementById('capacity-only-capacity');
    const zhankeCapacityInput = document.getElementById('zhanke-capacity');
    function getCurrentCapacity() {
        const emp = employeeTypeSelect ? employeeTypeSelect.value : '';
        if (emp === 'zhankejingli-zhuren') {
            return Number(zhankeCapacityInput ? zhankeCapacityInput.value : 0) || 0;
        }
        return Number(capacityOnlyInput ? capacityOnlyInput.value : 0) || 0;
    }
    if (capacityOnlyInput) {
        capacityOnlyInput.addEventListener('input', () => {
            const c = Number(capacityOnlyInput.value) || 0;
            const el = document.getElementById('capacity-only-total');
            if (el) el.textContent = formatMoney(c) + ' 元';
        });
    }
    if (zhankeCapacityInput) {
        zhankeCapacityInput.addEventListener('input', () => {
            const c = Number(zhankeCapacityInput.value) || 0;
            const el = document.getElementById('zhanke-capacity-total');
            if (el) el.textContent = formatMoney(c) + ' 元';
        });
    }
    // 计算奖金按钮点击事件
    calculateBtn.addEventListener('click', function() {
        const employeeType = employeeTypeSelect ? employeeTypeSelect.value : '';
        if (!employeeType) {
            alert('请选择员工序列');
            return;
        }
        
        let bonusResult = '';
        let totalBonus = 0;
        
        // 根据不同员工序列计算奖金
        if (employeeType === 'zhankejingli') {
            // 战客经理奖金计算
            // 计算木本业务产能
            let mubenTotal = 0;
            zkMubenInputs.forEach(inputId => {
                mubenTotal += Number(document.getElementById(inputId).value) || 0;
            });
            
            // 计算项目IT产能
            let xiangmuTotal = Number(document.getElementById('zk-zs-xiangmu').value) || 0;
            
            // 增收赛道产能需包含项目IT产能；若项目IT产能为0，则增收赛道产能强制为0
            let zsTotal = 0;
            if (xiangmuTotal > 0) {
                zsTotal = mubenTotal + xiangmuTotal;
            }
            
            // 木本业务赛道奖金计算 (实际规则)
            let mubenBonus = calculateZkMubenBonus(mubenTotal);
            
            // 增收赛道奖金计算 (实际规则)
            let zsBonus = calculateZkZsBonus(zsTotal);
            
            // computeBonus 已封顶，无需手动处理

            totalBonus = mubenBonus + zsBonus;
            
            bonusResult = `
                <div class="result-detail">
                    <div class="result-row">
                        <span>木本业务产能：</span>
                        <span>${formatMoney(mubenTotal)} 元</span>
                    </div>
                    <div class="result-row highlight">
                        <span>一赛道奖金（木本业务）：</span>
                        <span>${formatMoney(mubenBonus)} 元</span>
                    </div>
                    <div class="result-row">
                        <span>增收赛道产能（木本+项目）：</span>
                        <span>${formatMoney(zsTotal)} 元</span>
                    </div>
                    <div class="result-row highlight">
                        <span>二赛道奖金（增收赛道）：</span>
                        <span>${formatMoney(zsBonus)} 元</span>
                    </div>
                </div>
                <div class="result-total">
                    <div class="result-row">
                        <span>当月奖金总额：</span>
                        <span>${formatMoney(totalBonus)} 元</span>
                    </div>
                </div>
            `;
        } else if (employeeType === 'shangkejingli' || employeeType === 'wanggejingli' || employeeType === 'wanggejingli-zhong' || employeeType === 'wanggejingli-ruo') {
            // 商客/网格客户经理奖金计算
            // 计算木本业务产能
            let mubenTotal = 0;
            wgskMubenInputs.forEach(inputId => {
                mubenTotal += Number(document.getElementById(inputId).value) || 0;
            });
            
            // 计算其他产能（项目IT和直销队）
            let xiangmuTotal = Number(document.getElementById('wgsk-gr-xiangmu').value) || 0;
            let zhixiaoTotal = Number(document.getElementById('wgsk-td-jiedui').value) || 0;
            
            // 计算个人增收赛道产能 (一赛道) - 木本业务+项目IT
            let grTotal = mubenTotal + xiangmuTotal;
            
            // 计算团队增收赛道产能 (二赛道) - 木本业务+直销队+项目IT
            let tdTotal = mubenTotal + zhixiaoTotal + xiangmuTotal;
            
            // 个人增收赛道奖金计算 (一赛道)
            let grBonus = calculateWgskGrBonus(grTotal, employeeType);
            
            // 团队增收赛道奖金计算 (二赛道)
            let tdBonus = calculateWgskTdBonus(tdTotal, employeeType);

            /* 管控系数逻辑：自拓完成率<50%时，团队激励*0.5 */
            const grRule = getRule(levelSelect ? levelSelect.value : '', employeeType, 'gr');
            const target2 = grRule?.target2 || 1;
            const completionRate = grTotal / target2;
            if (completionRate < 0.5) {
                tdBonus *= 0.5;
            }
  
            totalBonus = grBonus + tdBonus;
            
            bonusResult = `
                <div class="result-detail">
                    <div class="result-row">
                        <span>木本业务产能：</span>
                        <span>${formatMoney(mubenTotal)} 元</span>
                    </div>
                    <div class="result-row">
                        <span>个人增收赛道产能（木本+项目）：</span>
                        <span>${formatMoney(grTotal)} 元</span>
                    </div>
                    <div class="result-row highlight">
                        <span>一赛道奖金（个人增收）：</span>
                        <span>${formatMoney(grBonus)} 元</span>
                    </div>
                    <div class="result-row">
                        <span>团队增收赛道产能（木本+直销队+项目）：</span>
                        <span>${formatMoney(tdTotal)} 元</span>
                    </div>
                    <div class="result-row highlight">
                        <span>二赛道奖金（团队增收）：</span>
                        <span>${formatMoney(tdBonus)} 元</span>
                    </div>
                </div>
                <div class="result-total">
                    <div class="result-row">
                        <span>当月奖金总额：</span>
                        <span>${formatMoney(totalBonus)} 元</span>
                    </div>
                </div>
            `;
        } else if (employeeType === 'jiejuefangan' || employeeType === 'zhankejingli-zhuren' || employeeType === 'shangkejingli-zhuren' || employeeType === 'zonghe-zhong' || employeeType === 'zonghe-zhong-zhong' || employeeType === 'zonghe-zhong-ruo') {
            // 解决方案经理/中心主任奖金计算
            // 直接获取单一产能输入
            const totalCapacity = getCurrentCapacity();
            
            // 根据产能计算奖金 (实际规则)
            let bonus = calculateJfzxBonus(totalCapacity, employeeType);
            totalBonus = bonus;
            
            bonusResult = `
                <div class="result-detail">
                    <div class="result-row">
                        <span>当月总产能：</span>
                        <span>${formatMoney(totalCapacity)} 元</span>
                    </div>
                </div>
                <div class="result-total">
                    <div class="result-row highlight">
                        <span>当月奖金总额：</span>
                        <span>${formatMoney(totalBonus)} 元</span>
                    </div>
                </div>
            `;
        }
        
        // 显示结果
        resultContent.innerHTML = bonusResult;
        resultDiv.classList.remove('hidden');
        
        // 滚动到结果区域
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 格式化金额
    function formatMoney(amount) {
        amount = Number(amount);
        return amount.toLocaleString('zh-CN', {maximumFractionDigits: 0});
    }
    
    // 奖金计算通用函数映射
    function calculateZkMubenBonus(amount) {
        const levelKey = levelSelect ? levelSelect.value : '';
        return computeBonusFor(levelKey, 'zhankejingli', 'muben', amount);
    }
    function calculateZkZsBonus(amount) {
        const levelKey = levelSelect ? levelSelect.value : '';
        return computeBonusFor(levelKey, 'zhankejingli', 'zs', amount);
    }
    function calculateWgskGrBonus(amount, employeeType) {
        const levelKey = levelSelect ? levelSelect.value : '';
        return computeBonusFor(levelKey, employeeType, 'gr', amount);
    }
    function calculateWgskTdBonus(amount, employeeType) {
        const levelKey = levelSelect ? levelSelect.value : '';
        return computeBonusFor(levelKey, employeeType, 'td', amount);
    }
    function calculateJfzxBonus(amount, employeeType) {
        const levelKey = levelSelect ? levelSelect.value : '';
        const empRule = getRule(levelKey, employeeType);
        if (!empRule) return 0;
        if (employeeType === 'zhankejingli-zhuren' && empRule.fixed) {
            const people = Number(jfzxPeopleCountInput ? jfzxPeopleCountInput.value : 0) || 0;
            const per = empRule.fixed.target2_per_person;
            const effectiveTarget = people > 0 ? people * per : 0;
            return calculateFixedBonusCustom(amount, empRule.fixed, effectiveTarget);
        }
        if (empRule.linear) return calculateLinearBonus(amount, empRule.linear);
        if (empRule.fixed) return calculateFixedBonus(amount, empRule.fixed);
        return 0;
    }

    function calculateFixedBonus(amount, rule) {
        if (!rule) return 0;
        const completion = rule.target2 ? amount / rule.target2 : 0;
        for (const b of rule.bonus) {
            if (completion >= b.min) {
                return b.fixed;
            }
        }
        return 0;
    }

    function calculateLinearBonus(amount, rule) {
        if (!rule) return 0;
        const completion = rule.target ? amount / rule.target : 0;
        let bonus = completion * rule.factor;
        return rule.max ? Math.min(bonus, rule.max) : bonus;
    }

    function calculateRateBonus(amount, rule) {
        if (!rule) return 0;
        const completion = rule.target2 ? amount / rule.target2 : 0;
        for (const r of rule.rates) { // 规则应按min降序排序
            if (completion >= r.min) {
                let bonus = amount * r.rate;
                return rule.max ? Math.min(bonus, rule.max) : bonus;
            }
        }
        return 0;
    }

    // 属性序列所属规则键映射
    const attrSequenceMap = {
        'wanggejingli': 'attr-heavy',
        'zonghe-zhong-zhong': 'attr-heavy',
        'wanggejingli-zhong': 'attr-medium',
        'zonghe-zhong': 'attr-medium',
        'wanggejingli-ruo': 'attr-weak',
        'zonghe-zhong-ruo': 'attr-weak'
    };

    function getRule(levelKey, employeeType, track) {
        const layers = bonusRules?.layers;
        if (!layers) return null;
        const attrLayerKey = attrSequenceMap[employeeType];
        const bucket = attrLayerKey ? layers[attrLayerKey] : layers[levelKey];
        if (!bucket) return null;
        const empRule = bucket[employeeType];
        if (!empRule) return null;
        return track ? empRule[track] : empRule;
    }

    function computeBonusFor(levelKey, employeeType, track, amount) {
        const rule = getRule(levelKey, employeeType, track);
        if (!rule) return 0;
        if (rule.rates) return calculateRateBonus(amount, rule);
        if (rule.fixed) return calculateFixedBonus(amount, rule);
        if (rule.linear) return calculateLinearBonus(amount, rule);
        return 0;
    }

    // 自定义固定档位：支持动态目标
    function calculateFixedBonusCustom(amount, fixedRule, effectiveTarget2) {
        if (!fixedRule || !effectiveTarget2) return 0;
        return calculateFixedBonus(amount, { target2: effectiveTarget2, bonus: fixedRule.bonus });
    }

    // 规则提示（重构：按角色输出简洁说明）
    // 规则提示功能已删除
});