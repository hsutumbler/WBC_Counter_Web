document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    const limitInput = document.getElementById('limit');
    const saveLimitBtn = document.getElementById('saveLimit');
    const saveFieldsBtn = document.getElementById('saveFields');

    const resetBtn = document.getElementById('reset');
    const alertSound = document.getElementById('alertSound');
    const openDefinitionModalBtn = document.getElementById('openDefinitionModal');
    const definitionModal = document.getElementById('definitionModal');
    const closeDefinitionBtn = document.querySelector('.close-definition');
    const drawerBackdrop = document.querySelector('.drawer-backdrop');
    
    // SID 欄位相關元素
    const sidInput = document.getElementById('sidInput');
    const clearSidBtn = document.getElementById('clearSid');
    
    // 預先載入音效
    alertSound.load();
    console.log('開始載入音效');
    
    // 監聽音效載入狀態
    alertSound.addEventListener('canplaythrough', () => {
        console.log('音效載入完成，準備就緒');
    });

    // 模態視窗控制
    openDefinitionModalBtn.addEventListener('click', () => {
        definitionModal.classList.add('active');
        // 更新模組列表
        updateModuleList();
    });

    closeDefinitionBtn.addEventListener('click', () => {
        definitionModal.classList.remove('active');
    });

    drawerBackdrop.addEventListener('click', () => {
        definitionModal.classList.remove('active');
    });

    // 儲存模組功能
    const saveModuleBtn = document.getElementById('saveModule');
    const moduleNameInput = document.getElementById('moduleName');
    const moduleSelect = document.getElementById('moduleSelect');
    const loadModuleBtn = document.getElementById('loadModule');
    const deleteModuleBtn = document.getElementById('deleteModule');

    // 更新模組列表
    function updateModuleList() {
        const modules = JSON.parse(localStorage.getItem('fieldModules') || '{}');
        moduleSelect.innerHTML = '<option value="">選擇已儲存的模組</option>';
        Object.keys(modules).forEach(moduleName => {
            const option = document.createElement('option');
            option.value = moduleName;
            option.textContent = moduleName;
            moduleSelect.appendChild(option);
        });
    }

    // 保存當前欄位定義為新模組
    saveModuleBtn.addEventListener('click', () => {
        const moduleName = moduleNameInput.value.trim();
        if (!moduleName) {
            alert('請輸入模組名稱');
            return;
        }

        // 收集當前欄位定義
        const fieldDefinitions = {};
        document.querySelectorAll('.counter').forEach(counter => {
            const key = counter.dataset.key;
            const input = counter.querySelector('.field-name');
            const exclude = counter.querySelector('.exclude-from-total');
            fieldDefinitions[key] = {
                definition: input.value,
                excludeFromTotal: exclude ? exclude.checked : false
            };
        });

        // 儲存到 localStorage
        const modules = JSON.parse(localStorage.getItem('fieldModules') || '{}');
        modules[moduleName] = fieldDefinitions;
        localStorage.setItem('fieldModules', JSON.stringify(modules));

        // 更新模組列表並清空輸入框
        updateModuleList();
        moduleNameInput.value = '';
        alert('模組已儲存');
    });

    // 載入選定的模組
    loadModuleBtn.addEventListener('click', () => {
        const selectedModule = moduleSelect.value;
        if (!selectedModule) {
            alert('請選擇要載入的模組');
            return;
        }

        const modules = JSON.parse(localStorage.getItem('fieldModules') || '{}');
        const fieldDefinitions = modules[selectedModule];

        // 套用欄位定義
        document.querySelectorAll('.counter').forEach(counter => {
            const key = counter.dataset.key;
            if (fieldDefinitions[key]) {
                const input = counter.querySelector('.field-name');
                const exclude = counter.querySelector('.exclude-from-total');
                input.value = fieldDefinitions[key].definition;
                if (exclude) {
                    exclude.checked = fieldDefinitions[key].excludeFromTotal;
                }
            }
        });

        // 儲存欄位定義到 localStorage
        localStorage.setItem('fieldDefinitions', JSON.stringify(fieldDefinitions));
        definitionModal.classList.remove('active');
        alert('模組已載入');
    });

    // 刪除選定的模組
    deleteModuleBtn.addEventListener('click', () => {
        const selectedModule = moduleSelect.value;
        if (!selectedModule) {
            alert('請選擇要刪除的模組');
            return;
        }

        if (confirm(`確定要刪除模組「${selectedModule}」嗎？`)) {
            const modules = JSON.parse(localStorage.getItem('fieldModules') || '{}');
            delete modules[selectedModule];
            localStorage.setItem('fieldModules', JSON.stringify(modules));
            updateModuleList();
            alert('模組已刪除');
        }
    });

    const totalCountElement = document.getElementById('totalCount');

    let limit = 100;
    let totalCount = 0;
    let fieldDefinitions = {};
    let isEditingLimit = false;

    // 監聽計數上限輸入框的聚焦狀態
    limitInput.addEventListener('focus', () => {
        isEditingLimit = true;
    });

    limitInput.addEventListener('blur', () => {
        isEditingLimit = false;
    });

    // 載入上次儲存的欄位定義
    function loadFieldDefinitions() {
        const savedDefinitions = localStorage.getItem('fieldDefinitions');
        if (savedDefinitions) {
            fieldDefinitions = JSON.parse(savedDefinitions);
            counters.forEach(counter => {
                const key = counter.getAttribute('data-key');
                const fieldNameInput = counter.querySelector('.field-name');
                if (fieldDefinitions[key]) {
                    fieldNameInput.value = fieldDefinitions[key];
                }
            });
        }
    }

    // 儲存欄位定義
    function saveFieldDefinitions() {
        counters.forEach(counter => {
            const key = counter.getAttribute('data-key');
            const fieldNameInput = counter.querySelector('.field-name');
            fieldDefinitions[key] = fieldNameInput.value;
        });
        localStorage.setItem('fieldDefinitions', JSON.stringify(fieldDefinitions));
        alert('欄位定義已儲存！');
    }

    // SID 欄位功能
    // 載入上次儲存的 SID
    function loadSID() {
        const savedSID = localStorage.getItem('currentSID');
        if (savedSID) {
            sidInput.value = savedSID;
        }
    }

    // 儲存 SID
    function saveSID() {
        localStorage.setItem('currentSID', sidInput.value);
    }

    // 清除 SID
    clearSidBtn.addEventListener('click', () => {
        sidInput.value = '';
        saveSID();
        sidInput.focus();
    });

    // 當 SID 輸入框內容變更時自動儲存
    sidInput.addEventListener('input', saveSID);

    // 當 SID 輸入框獲得焦點時，自動選取所有文字
    sidInput.addEventListener('focus', () => {
        sidInput.select();
    });

    // 當按下 Enter 鍵時，自動聚焦到計數區域
    sidInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // 聚焦到第一個計數器
            const firstCounter = document.querySelector('.counter');
            if (firstCounter) {
                firstCounter.focus();
            }
        }
    });

    // 初始化
    loadFieldDefinitions();
    loadSID();

    // 儲存上限
    saveLimitBtn.addEventListener('click', () => {
        limit = parseInt(limitInput.value);
        alert('上限已儲存！');
    });

    // 儲存欄位定義
    saveFieldsBtn.addEventListener('click', saveFieldDefinitions);

    // 鍵盤輸入支援
    document.addEventListener('keydown', (e) => {
        if (isEditingLimit) return; // 如果正在編輯上限，則不處理數字鍵輸入
        
        // 如果 SID 輸入框有焦點，則不處理數字鍵輸入
        if (document.activeElement === sidInput) return;

        const key = e.key;
        if ((key >= '0' && key <= '9') || key === '.') {
            const dataKey = key === '.' ? 'dot' : key;
            const counter = document.querySelector(`.counter[data-key="${dataKey}"]`);
            if (counter) {
                incrementCounter(counter);
            }
        }
    });

    // 增加計數
    counters.forEach(counter => {
        const incrementBtn = counter.querySelector('.increment');
        incrementBtn.addEventListener('click', () => {
            incrementCounter(counter);
        });

        // 減少計數
        const decrementBtn = counter.querySelector('.decrement');
        decrementBtn.addEventListener('click', () => {
            decrementCounter(counter);
        });
    });

    // 重新計算總數
    function recalculateTotal() {
        totalCount = 0;
        counters.forEach(counter => {
            const count = parseInt(counter.querySelector('.count').textContent);
            const excludeCheckbox = counter.querySelector('.exclude-from-total');
            
            // 如果是數字0或點號且被勾選"不計入總數"，則跳過
            if (excludeCheckbox && excludeCheckbox.checked) {
                return;
            }
            totalCount += count;
        });
        totalCountElement.textContent = totalCount;
    }

    // 監聽核取方塊變更（只有數字0和點號有）
    const excludeCheckboxes = document.querySelectorAll('.exclude-from-total');
    excludeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', recalculateTotal);
    });

    // 播放警示音和顯示警告
    async function playAlertAndShowMessage() {
        try {
            // 確保音效從頭開始播放
            alertSound.currentTime = 0;
            alertSound.volume = 1.0;  // 設定音量最大
            
            // 檢查音效是否已經載入
            if (alertSound.readyState === 4) {
                console.log('音效已載入，開始播放');
                await alertSound.play();
                console.log('音效播放完成');
            } else {
                console.log('音效尚未載入完成');
                // 等待音效載入
                alertSound.load();
                await new Promise((resolve) => {
                    alertSound.oncanplaythrough = resolve;
                });
                console.log('音效載入完成，開始播放');
                await alertSound.play();
                console.log('音效播放完成');
            }
            
            // 確保音效有播放一段時間後再顯示警告
            await new Promise(resolve => setTimeout(resolve, 200));
            alert(`已達到總計上限 ${limit}！`);
        } catch (error) {
            console.error('播放音效失敗:', error);
            console.log('錯誤詳情:', error.message);
            // 如果音效播放失敗，至少顯示警告
            alert(`已達到總計上限 ${limit}！`);
        }
    }

    function incrementCounter(counter) {
        const countElement = counter.querySelector('.count');
        let count = parseInt(countElement.textContent);
        const excludeCheckbox = counter.querySelector('.exclude-from-total');
        
        // 如果不是被排除的欄位（數字0或點號被勾選不計入）且已達到上限
        if ((!excludeCheckbox || !excludeCheckbox.checked) && totalCount >= limit) {
            playAlertAndShowMessage();
            return;
        }

        count++;
        countElement.textContent = count;
        
        // 如果不是被排除的欄位，則計入總數
        if (!excludeCheckbox || !excludeCheckbox.checked) {
            totalCount++;
            totalCountElement.textContent = totalCount;
            
            if (totalCount === limit) {
                playAlertAndShowMessage();
            }
        }
    }

    function decrementCounter(counter) {
        const countElement = counter.querySelector('.count');
        let count = parseInt(countElement.textContent);
        const excludeCheckbox = counter.querySelector('.exclude-from-total');
        
        if (count > 0) {
            count--;
            countElement.textContent = count;
            
            // 如果不是被排除的欄位，則從總數中減去
            if (!excludeCheckbox || !excludeCheckbox.checked) {
                totalCount--;
                totalCountElement.textContent = totalCount;
            }
        }
    }

    // 產生結論
    function generateSummary() {
        const summary = document.getElementById('summary');
        const summaryContent = summary.querySelector('.summary-content');
        let content = '';
        
        // 計算總計數（包含未計入總數的項目）
        let allTotal = 0;
        let includedTotal = 0;
        let items = [];
        
        // 定義排序順序：數字1-9、數字0、點號
        const sortOrder = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'dot'];
        
        // 按照指定順序收集項目
        sortOrder.forEach(key => {
            const counter = document.querySelector(`.counter[data-key="${key}"]`);
            if (counter) {
                const label = counter.querySelector('label').textContent.replace('：', '');
                const fieldName = counter.querySelector('.field-name').value || label;
                const count = parseInt(counter.querySelector('.count').textContent);
                const excludeCheckbox = counter.querySelector('.exclude-from-total');
                
                if (count > 0) {
                    allTotal += count;
                    if (!excludeCheckbox || !excludeCheckbox.checked) {
                        includedTotal += count;
                    }
                    
                    items.push({
                        key: key,
                        name: fieldName,
                        count: count,
                        excluded: excludeCheckbox && excludeCheckbox.checked
                    });
                }
            }
        });
        
        // 產生摘要內容
        content += '<div class="summary-item">總數: ' + includedTotal + ' 顆</div>';
        
        if (allTotal !== includedTotal) {
            content += '<div class="summary-item">全部: ' + allTotal + ' 顆</div>';
        }
        
        // 顯示個別項目（已按順序排列）
        items.forEach(item => {
            const percentage = ((item.count / includedTotal) * 100).toFixed(1);
            content += '<div class="summary-item">';
            content += `${item.name}: ${item.count} 顆 (${!item.excluded ? percentage + '%' : '未計入'})`;
            content += '</div>';
        });
        
        // 顯示結論區塊
        summaryContent.innerHTML = content;
        summary.style.display = 'block';
    }

    // 綁定顯示結論按鈕
    const showSummaryBtn = document.getElementById('showSummary');
    showSummaryBtn.addEventListener('click', generateSummary);



    // 清空欄位
    resetBtn.addEventListener('click', () => {
        counters.forEach(counter => {
            const countElement = counter.querySelector('.count');
            countElement.textContent = '0';
        });
        recalculateTotal();
        
        // 清空 SID
        sidInput.value = '';
        saveSID();
        
        // 隱藏結論區域
        const summary = document.getElementById('summary');
        summary.style.display = 'none';
    });
}); 