import React, {useState, useEffect} from 'react'

const dimension = 8;

const Board = () => {
  const [game, setGame] = useState([]);

  const makeGameBoard = ()=>{
    let arr = [];

    for (let i=0;i<dimension;i++){
      let temp = [];
      for (let j=0;j<dimension;j++){
          temp.push(<div className='board_square'></div>);
      }
      arr.push(temp);
    }

    setGame(arr);
  }

  useEffect(()=>{
    makeGameBoard();
  })

  return (
    <div className='board'>
      <section className='board_box'>
        {game}
      </section>

    </div>
  );
}

export default Board