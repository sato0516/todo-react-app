import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // 状態を定義（※クラスコンポーネントでいうthis.stateとthis.setStateの役割）
  const [task, setTask] = useState('');
  const [todoList,setTodoList] = useState([]);  //空の文字列ではなく、空の配列を初期値としている。
  const [dueDate, setDueDate] = useState("");

  const handleAddTask = () => {  //関数コンポーネントではconstで関数を定義する。※constなしで定義できるのはクラス内特有。
    if (task.trim() === '') return; 
    
    const newTask = {text: task,completed: false,dueDate: dueDate};//オブジェクトとして完了状態を定義。
    setTodoList([...todoList, newTask]); //配列として新しい要素を追加する場合、こう書く。setA([...A, 新しい要素]);
    setTask('');  // 状態の更新（入力欄を空にする）。
    setDueDate(''); // 状態の更新（期日入力欄を空にする）。
  };

  const handleDeleteTask = (indexToDelete) => {
    //todoList という配列から、特定の index を除いた新しい配列を作る。＝削除したいタスクを除いた新しいリスト
    const newList = todoList.filter((_, index) => index !== indexToDelete); 
    setTodoList(newList); //削除後の状態の更新＝削除したいタスクを除いた新しいリスト

    //.filter((要素,インデックス) => 条件式)でtrueの要素だけ残すメソッド※条件に合う要素だけを残すための関数
    //「_」は使わない変数の省略記法。itemのままでもOKだけど、今回の処理で参照しない値なので「_」が適切。
    /*たとえば todoList = ['A', 'B', 'C'] で indexToDelete = 1 とすると、
    　index !== 1　を残す、つまりindex === 1（つまり'B'）だけを除外し、結果は ['A', 'C'] となる。*/
  };

  // タスクの「完了状態」を切り替える関数
  const handleToggleComplete = (indexToToggle) => {
  // indexToToggle : チェックが押されたタスクの「配列での位置」＝そのタスクが配列の 何番目 かを渡している
  // これは onChange={() => handleToggleComplete(index)} で渡されています

  // 新しい配列を作る（元の配列を直接変えないのがReactの鉄則）
    const updatedList = todoList.map((task, index) => {
    // task  : 今処理している1つのタスク（オブジェクト）
    // index : そのタスクの配列での位置（0,1,2,...）

    // 押されたタスクの位置（indexToToggle）と今のindexが一致したら
      if (index === indexToToggle) {
      // ...task で元のプロパティをコピーしつつ、
      // completed プロパティだけを ! で反転させたオブジェクトを返す
        return { ...task, completed: !task.completed };
      }

    // それ以外のタスクは何も変えずに返す
      return task;
    });

  // 新しい配列を状態としてセット（これで画面が再描画される）
    setTodoList(updatedList);
  };

  //期日の計算をするための関数　※dateStr は date string（＝日付の文字列）の略
  const MS_PER_DAY = 24 * 60 * 60 * 1000; //1日のミリ秒数（24時間 * 60分 * 60秒 * 1000ミリ秒）
  
  function toLocalDate(dateStr){ //'2025-08-14' のような文字列を東京ローカル日付(0:00)で比較できるDateへ直す
    if (!dateStr) return null; //空文字列ならnullを返す※扱えないため
    const [y,m,d] = dateStr.split('-').map(Number); //文字列を「2025」「08」「14」分割してmap(Number) で数値に変換
    return new Date(y, m - 1, d); //※ローカルタイムの 年/月/日 0:00 を作る※月は0から始まるので、m-1とする…０＝1月、１＝2月…なので、8月なら「m - 1＝7」とすることで「8月」を指す。
  }

  function daysUntil(dateStr){ //今日からの残り日数
    const due = toLocalDate(dateStr); //dueは「期日」の省略
    if (!due) return null; //期日が無い場合はnullを返し、「期限なし」扱いにする
    const now = new Date(); //現在のローカル時間 ex)2025-08-18 16:42:10
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //その日の開始時刻ex)2025-08-18 00:00:00
    const diffMs = due - today; //期日と今日の差をミリ秒で計算
    return Math.floor(diffMs / MS_PER_DAY); //ミリ秒を日数に変換して返す
  }

  // 残り日数に応じてクラス名を決定
  function getDueClass(dateStr) {
    const d = daysUntil(dateStr);
    if (d === null) return 'due--none';    // 期日なし
    if (d < 0)      return 'due--overdue'; // 期限超過→虹色
    if (d === 0)    return 'due--today';   // 今日→赤
    if (d <= 3)     return 'due--soon';    // 3日以内→黄色
    if (d <= 7)     return 'due--week';    // 1週間以内
    return 'due--later';                   // 8日以上
  }

  //見栄えを整える（"2025-08-14" → "2025/08/14" に変換＆期日がないときは「期日なし」と表示）
  function formatDue(dateStr) {
    return dateStr ? dateStr.replace(/-/g, '/') : '期限なし';
  }

  return (
    <div className='app'>
      <div className='card'>
        <header className='header'>
          <h1 className='title'>TODOリスト</h1>
          <div className='form'>
            <input 
              type='text'
              placeholder="やることを入力" //chatgptが例で記載してた所。入力欄に薄く表示されるヒント文字。
              value={task}
              onChange={(event) => {
                console.log(event.target.value);
                setTask(event.target.value);      // 状態の更新も必要！
              }}
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button onClick ={handleAddTask}>追加</button> 
          </div>
        </header>

        <ul className='taskList'>
          {todoList.map((item, index) => {
            //itemやindexは変数。慣用的な名前なだけ。変更してOK。.map((1つ1つの中身, その順番) => { ... })
            //key={index}は初学者は型として覚える。Reactが「リストのどの項目が変わったか」を見つけやすくするおまじない（エラー防止）。
            return(
              <li
                key={index}
                className={`taskItem ${item.completed ? "isDone" : ""}`}//JSXで条件付きクラス名をつける典型的な書き方。[item.completed]がtrueなら"taskItem isDone"、falseなら"taskItem"というクラス名をつける。 isDoneで完了タスクの装飾ができるようになる。             
              >
                <input
                  type='checkbox'
                  checked={item.completed}
                  onChange={() => handleToggleComplete(index)}
                />

                 {/* タスク全体をまとめるコンテナ */}
                <div className='taskContent'>
                  <span className='taskText'>{item.text}</span>
                  <span //期日表示のためのspanタグ
                    className={`dueDate ${getDueClass(item.dueDate)}`}
                    title={`残り日数: ${daysUntil(item.dueDate) ?? '—'}`}
                    aria-label={`期日: ${formatDue(item.dueDate)}`}
                  >
                    {formatDue(item.dueDate)}
                  </span>
                </div>

                <button
                  className='iconBtn'
                  onClick={() => handleDeleteTask(index)}
                >
                  削除
                </button> {/*onClick={handleDeleteTask(index)}はダメ。関数を呼び出すのではなく、「関数を実行した結果」を渡すことになっちゃう。※onClick={handleAddTask}は引数がないため、関数そのものを渡せているのでOK※クリックでhandleAddTask()が呼ばれる）*/}
              </li>
            ); 
          })}
        </ul>

        {/*上記の書き換えメモ…以下の省略形が定番パターン

        {配列.map((item, index) => (
          <JSXを返す>
        ))}

        {todoList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
        
        ▼比較用
        {todoList.map((item, index) => {
          return<li key={index}>{item}</li>;
        })}

        */}
      </div>
    </div>
  );
}

export default App;

/*作成メモ
●タイトルの表示<h1>
●テキスト入力欄の作成
　∟チェック項目：入力欄を表示できたか、文字を打てるか、入力と状態が連動するか
●追加ボタンの作成
　∟チェック項目：追加ボタンが表示されるか、ボタンを押すと入力欄が空になるか※todoListに追加されているかは次のステップで表示し、確認する
●タスクリストの表示
　∟チェック項目：「追加」ボタンを押すと入力した内容（タスク）がリスト形式で表示されるか
●特定のタスクの削除
　∟チェック項目：「削除」ボタンが各行に表示されるか、押下でそのタスクだけが消えるか（ほかのタスクは影響を受けないか）

以降やってみたい
●完了マークの作成
  ・タスクの左にチェックボックスを表示する
  ・完了状態としてタスクを扱えるようにする＝stateに記録する※完了未完了のカウントや、完了タスクの非表示/CSSで線引きや色付けするにも必要
  　∟そのためにstateは「文字列」→「オブジェクト」へ修正
  ・チェックが押されたときに状態（completed）のT/Fを反転させる（onChangeイベント）


●CSSでレイアウト変更
*/