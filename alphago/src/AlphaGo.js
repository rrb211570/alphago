import './AlphaGo.css';
import { useEffect, useState } from 'react';
import placeable from './data/gameInteraction/placement/placement.js';
import { swapTurn, updatePlacedStones, deletePlacedStone } from './store/reducers/gamePlaySlice.js'
import { store } from './store/store.js';
// import turn, boardLength from store

function AlphaGo() {
  const [clickSquares, setClickSquares] = useState([<div id='filler' key='1'></div>]);

  useEffect(() => {
    let boardLength = store.getState().gamePlay.boardLength;
    console.log(boardLength);
    console.log(store.getState().gamePlay)
    let clickSquares = [];
    for (let i = 0; i < boardLength; ++i) {
      let clickRow = [];
      for (let j = 0; j < boardLength; ++j) {
        clickRow.push(<div id={'clickSquare_' + i + '_' + j} key={'clickSquare_' + i + '_' + j} onMouseOver={showStone} onClick={placeStone} onMouseLeave={hideStone}
          style={{ position: 'absolute', height: '29px', width: '29px', marginLeft: -13.5 + 29 * j + 'px', marginTop: -13.5 + 29 * i + 'px' }}>
          <svg display={'none'} style={{ opacity: '0.7' }}><use id={'hiddenStone_' + j + '_' + i} href="#plain-white-14.5-2" /></svg>
        </div>)
      }
      clickSquares.push(clickRow);
    }
    console.log(clickSquares);
    setClickSquares(clickSquares);
  }, [])

  const showStone = (e) => {
    let turn = store.getState().gamePlay.turn;
    let clickSquareID = e.currentTarget.id;
    let indices = /^.*(\d+).*(\d+)$/.exec(clickSquareID).slice(1, 3).join('_');
    if (!stoneExists(indices)) {
      if (turn == 'white') document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-white-14.5-2');
      else document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-black-14.5-3');
      document.querySelector('#' + e.currentTarget.id + ' svg').style.display = 'block';
    }
  }

  let hideStone = (e) => {
    let clickSquareID = e.currentTarget.id;
    let indices = /^.*(\d+).*(\d+)$/.exec(clickSquareID).slice(1, 3).join('_');
    if (!stoneExists(indices)) {
      document.querySelector('#' + e.currentTarget.id + ' svg').style.display = 'none';
    }
  }

  const placeStone = (e) => {
    let placedStones = [...store.getState().gamePlay.placedStones];
    let clickSquareID = e.currentTarget.id;
    let indices = /^.*(\d+).*(\d+)$/.exec(clickSquareID).slice(1, 3).join('_');
    if (!stoneExists(indices)) {
      alignColors(clickSquareID);
      // check placeable
      placedStones.push(indices);
      store.dispatch(updatePlacedStones({ placedStones }));
      if (placeable(clickSquareID)) {
        document.querySelector('#' + clickSquareID + ' svg').display = 'block';
        document.querySelector('#' + clickSquareID + ' svg').style.opacity = '1';
        console.log('placed');
        store.dispatch(swapTurn());
      } else {
        store.dispatch(deletePlacedStone({ indices }));
        document.querySelector('#' + e.currentTarget.id + ' svg').style.display = 'none';
        console.log('not placeable');
      }
    }
  }

  let alignColors = (clickSquareID) => {
    if (store.getState().gamePlay.turn == 'white') document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-white-14.5-2');
    else document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-black-14.5-3');
  }

  let stoneExists = (indices) => {
    if (store.getState().gamePlay.placedStones.find((elem) => elem == indices) == undefined) return false;
    return true;
  }

  return (
    <div className="AlphaGo">
      <div id='navBar'>
        <div id='navBarMenu'>
          <div className='navBarEntry'><button className='navBarItem'>Home</button></div>
          <div className='navBarEntry'><button className='navBarItem'>Play</button></div>
          <div className='navBarEntry'><button className='navBarItem'>Learn</button></div>
          <div className='navBarEntry'><button className='navBarItem'>Watch</button></div>
          <div className='navBarEntry'><button className='navBarItem'>Tools</button></div>
          <p className='navBarFiller'>Filler</p>
          <div className='navBarEntry'><button className='navBarSignIn'>Sign In</button></div>
        </div>
      </div>
      <div></div>
      <div id='Goban'>
        <div width="319" height="319" >
          <svg width="319" height="319" style={{ padding: '5px 5px 0 0' }}>
            <defs>
              <radialGradient id="shadow-black" r="1.0">
                <stop offset="0" stopColor="black" stopOpacity="1.0"></stop>
                <stop offset="30%" stopColor="black" stopOpacity="1.0"></stop>
                <stop offset="31%" stopColor="#333333" stopOpacity="0.6"></stop>
                <stop offset="34%" stopColor="#333333" stopOpacity="0.50"></stop>
                <stop offset="40%" stopColor="#333333" stopOpacity="0.5"></stop>
                <stop offset="50%" stopColor="#333333" stopOpacity="0.0"></stop>
              </radialGradient>
              <radialGradient id="shadow-white" r="1.0">
                <stop offset="0" stopColor="white" stopOpacity="1.0"></stop>
                <stop offset="30%" stopColor="white" stopOpacity="1.0"></stop>
                <stop offset="31%" stopColor="#333333" stopOpacity="0.6"></stop>
                <stop offset="34%" stopColor="#333333" stopOpacity="0.50"></stop>
                <stop offset="40%" stopColor="#333333" stopOpacity="0.5"></stop>
                <stop offset="50%" stopColor="#333333" stopOpacity="0.0"></stop>
              </radialGradient>
              <g id="plain-white-14.5-2" className="stone">
                <circle stroke="hsl(8, 7%, 20%)" strokeWidth="0.7px" cx="14.5" cy="14.5" r="14.1375" shapeRendering="geometricPrecision" fill="url(#plain-white-14.5-2-gradient)"></circle>
                <defs>
                  <linearGradient x1="0.40" y1="0.10" x2="0.90" y2="0.90" id="plain-white-14.5-2-gradient">
                    <stop offset="0%" stopColor="hsl(8, 7%, 95%)"></stop>
                    <stop offset="90%" stopColor="hsl(226, 7%, 75%)"></stop>
                  </linearGradient>
                </defs>
              </g>
              <g id="plain-black-14.5-3" className="stone">
                <circle stroke="hsl(8, 7%, 20%)" strokeWidth="0.7px" cx="14.5" cy="14.5" r="14.1375" shapeRendering="geometricPrecision" fill="url(#plain-black-14.5-3-gradient)"></circle>
                <defs>
                  <linearGradient x1="0.40" y1="0.10" x2="0.70" y2="0.70" id="plain-black-14.5-3-gradient">
                    <stop offset="0%" stopColor="hsl(8, 7%, 27%)"></stop><stop offset="100%" stopColor="hsl(8, 7%, 12%)"></stop>
                  </linearGradient>
                </defs>
              </g>
            </defs>
            <g>
              <path d="M 43.5 43.5 L 43.5 275.5 M 72.5 43.5 L 72.5 275.5 M 101.5 43.5 L 101.5 275.5 M 130.5 43.5 L 130.5 275.5 M 159.5 43.5 L 159.5 275.5 M 188.5 43.5 L 188.5 275.5 M 217.5 43.5 L 217.5 275.5 M 246.5 43.5 L 246.5 275.5 M 275.5 43.5 L 275.5 275.5 M 43.5 43.5 L 275.5 43.5 M 43.5 72.5 L 275.5 72.5 M 43.5 101.5 L 275.5 101.5 M 43.5 130.5 L 275.5 130.5 M 43.5 159.5 L 275.5 159.5 M 43.5 188.5 L 275.5 188.5 M 43.5 217.5 L 275.5 217.5 M 43.5 246.5 L 275.5 246.5 M 43.5 275.5 L 275.5 275.5 " stroke="#000000" strokeWidth="1px" strokeLinecap="square"></path>
              <circle cx="101.5" cy="101.5" r="2.2px" fill="#000000"></circle>
              <circle cx="101.5" cy="217.5" r="2.2px" fill="#000000"></circle>
              <circle cx="159.5" cy="159.5" r="2.2px" fill="#000000"></circle>
              <circle cx="217.5" cy="101.5" r="2.2px" fill="#000000"></circle>
              <circle cx="217.5" cy="217.5" r="2.2px" fill="#000000"></circle>
            </g>
            <g className="coordinate-labels">
              <text x="44" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">A</text>
              <text x="73" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">B</text>
              <text x="102" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">C</text>
              <text x="131" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">D</text>
              <text x="160" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">E</text>
              <text x="189" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">F</text>
              <text x="218" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">G</text>
              <text x="247" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">H</text>
              <text x="276" y="19" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">J</text>
              <text x="44" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">A</text>
              <text x="73" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">B</text>
              <text x="102" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">C</text>
              <text x="131" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">D</text>
              <text x="160" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">E</text>
              <text x="189" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">F</text>
              <text x="218" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">G</text>
              <text x="247" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">H</text>
              <text x="276" y="309" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">J</text>
              <text x="15" y="48" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">9</text>
              <text x="15" y="77" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">8</text>
              <text x="15" y="106" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">7</text>
              <text x="15" y="135" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">6</text>
              <text x="15" y="164" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">5</text>
              <text x="15" y="193" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">4</text>
              <text x="15" y="222" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">3</text>
              <text x="15" y="251" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">2</text>
              <text x="15" y="280" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">1</text>
              <text x="305" y="48" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">9</text>
              <text x="305" y="77" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">8</text>
              <text x="305" y="106" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">7</text>
              <text x="305" y="135" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">6</text>
              <text x="305" y="164" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">5</text>
              <text x="305" y="193" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">4</text>
              <text x="305" y="222" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">3</text>
              <text x="305" y="251" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">2</text>
              <text x="305" y="280" fontSize="15px" fontWeight="bold" fill="rgba(0, 0, 0, 0.75)">1</text>
            </g>
            <g className="shadow-layer"></g>
            <g className="grid"></g>
          </svg>

        </div>
        <div id='GobanClickLayer' width="280" height="280" style={{ position: 'absolute', marginLeft: '43px', height: '233px', width: '233px' }}>
          {clickSquares}
        </div>
      </div>
    </div>
  );
}

export default AlphaGo;
