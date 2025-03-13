<script>
import GroupLink from "../../components/GroupLink.svelte";
import { createEventDispatcher } from 'svelte'; 

export let score = 10;
export let exam = null;
export let results = [];

    const DB_NAME = 'QuizScoresDB';
    const STORE_NAME = 'scores';
    const DB_VERSION = 1;
    const dispatch = createEventDispatcher();

    let scores = [];
    // DB相关
    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function saveScore() {
        try {
            const db = await initDB();
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const record = {
                score: score,
                totalQuestions: exam.quizs.length,
                correctAnswers: results.filter(v => v).length,
                timestamp: new Date().getTime()
            };

            store.add(record);
            
            transaction.oncomplete = () => {
                console.log('Score saved successfully');
                getAllScores(); 
            };
            transaction.onerror = (event) => console.error('Save error:', event.target.error);
        } catch (error) {
            console.error('Database error:', error);
        }
    }

    async function getAllScores() {
        try {
            const db = await initDB();
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // 按时间顺序存储
                const sortedScores = request.result.sort((a, b) => b.score - a.score);
                scores = sortedScores;
                console.log('Scores fetched:', scores); // log输出
            };

            request.onerror = (event) => console.error('Error fetching scores:', event.target.error);
        } catch (error) {
            console.error('Database error:', error);
        }
    }

    async function clearScores() {
        try {
            const db = await initDB();
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.clear();

            transaction.oncomplete = () => {
                console.log('All scores cleared');
                scores = [];
            };
            transaction.onerror = (event) => console.error('Error clearing scores:', event.target.error);
        } catch (error) {
            console.error('Database error:', error);
        }
    }

    $: if (exam) {
        saveScore();
    }


$: resultTitle = (() => {
    if(score === 10) return '当之无愧的京吹大师！';
    if(score >= 8) return '京吹上手！';
    if(score >= 6) return '还行吧。';
    if(score >= 4) return '京吹初心者。';
    if(score >= 2) return '京吹小白。';
    return '八嘎！';
})();

    const handleNewRound = () => {
        dispatch('new-round');
    };
</script>

{#if exam}
<div class="ui-middle-box result">
    <div class="content">
        <div style="padding: 10px;">
            <h1>{resultTitle}</h1>
            <p>共 {exam.quizs.length} 题，正确率 {results.filter(v=>v).length / 10 * 100}%</p>
            <p>获得 {score} 分</p>
        </div>
        <div style="padding: 20px 0 10;">
            <button class="ui-btn" on:click={handleNewRound}>开始新一轮</button>
        </div>
    </div>

    <!-- 历史分数 -->
    <div class="score-history">
        <h2>历史分数</h2>
        <div class="score-list">
            <ul>
                {#each scores as scoreRecord}
                    <li>得分: {scoreRecord.score} 分，时间: {new Date(scoreRecord.timestamp).toLocaleString()}</li>
                {/each}
            </ul>
        </div>
        {#if scores.length > 5}
            <div class="scrollable-list">
                <ul>
                    {#each scores.slice(0, 5) as scoreRecord}
                        <li>得分: {scoreRecord.score} 分，时间: {new Date(scoreRecord.timestamp).toLocaleString()}</li>
                    {/each}
                </ul>
        </div>
        {/if}
        <a href="#/" class="ui-btn" data-key="Enter">回首页</a>
        <button class="ui-btn" on:click={clearScores}>清除历史记录</button>
    </div>
    <div class="join">
        <h4>一起来建设！</h4>
        <div class="content">
            <p>
                对 美术、界面、内容、程序 感兴趣，<br>
                欢迎来 开发群 <GroupLink /> 一起聊聊
            </p>
        </div>
    </div>
</div> 
{/if}

<style lang="less">
.result {
    flex-direction: column;
    .content{
        max-width: 800px;
        h1{
            padding-bottom: 10px;
        }
    }
}

.score-history {
    padding: 20px;
    width: 300px;
    float: left;
}

.score-list {
    max-height: 200px;
    overflow-y: auto;
}

.scrollable-list {
    max-height: 200px;
    overflow-y: auto;
}

button {
    margin-top: 10px;
}

.join{
    padding: 20px;
    .content{
        font-size: 12px;
        padding: 4px 0;
    }
}
</style>