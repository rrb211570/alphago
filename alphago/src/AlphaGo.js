import './AlphaGo.css';
import { useEffect, useState } from 'react';

var boardLength = 9;
let placedStones = [];
let traversedStones = [];
let turn = 'white';
let stoneGroups = new Map();
let adjMap = new Map();

function AlphaGo() {
  const [clickSquares, setClickSquares] = useState([<div id='filler' key='1'></div>]);

  useEffect(() => {
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
    let clickSquareID = e.currentTarget.id;
    let indices = /^.*(\d+).*(\d+)$/.exec(clickSquareID).slice(1, 3).join('_');;
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
    let clickSquareID = e.currentTarget.id;
    let indices = /^.*(\d+).*(\d+)$/.exec(clickSquareID).slice(1, 3).join('_');
    traversedStones = [];
    if (!stoneExists(indices)) {
      alignColors(clickSquareID);
      // check placeable
      placedStones.push(indices);
      placeable2(clickSquareID);
      if (placeable(clickSquareID)) {
        document.querySelector('#' + clickSquareID + ' svg').style.display = 'block';
        document.querySelector('#' + clickSquareID + ' svg').style.opacity = '1';
        console.log('placed');
        swapTurn();
      } else {
        placedStones.pop();
        console.log('not placeable');
      }
    }
    console.log(placedStones);
  }

  // 1 adjacent open space ______________________ DONE
  let placeable = (indices) => {
    let [discard, x, y] = /^.*(\d+).*(\d+)$/.exec(indices);
    console.log('placeable: ' + x + ' ' + y);
    if (openSpace(parseInt(x, 10), parseInt(y, 10), 0)) return true;
    // check capturable
  }

  let openSpace = (x, y) => {
    if (stoneTraversed(x + '_' + y)) return false;
    console.log('openSpace: ' + x + ' ' + y);
    if (x < 0 || y < 0 || x > 8 || y > 8) return false;
    traversedStones.push(x + '_' + y);
    if (!stoneExists(x + '_' + y)) return true;
    else {
      if ((sameStone(x, y, x - 1, y) && !stoneTraversed(x - 1 + '_' + y)) && openSpace(x - 1, y)) return true;
      if ((sameStone(x, y, x + 1, y) && !stoneTraversed(x + 1 + '_' + y)) && openSpace(x + 1, y)) return true;
      if ((sameStone(x, y, x, y - 1) && !stoneTraversed(x + '_' + y - 1)) && openSpace(x, y - 1)) return true;
      if ((sameStone(x, y, x, y + 1) && !stoneTraversed(x + '_' + y + 1)) && openSpace(x, y + 1)) return true;
    }
    return false;
  }

  let sameStone = (x1, y1, x2, y2) => {
    if (x1 < 0 || y1 < 0 || x1 > 8 || y1 > 8) return false;
    if (x2 < 0 || y2 < 0 || x2 > 8 || y2 > 8) return false;
    if (!stoneExists(x2 + '_' + y2)) return true;
    let currentStoneState = document.querySelector('#clickSquare_' + x1 + '_' + y1 + ' use').getAttribute('href');
    let adjacentStoneState = document.querySelector('#clickSquare_' + x2 + '_' + y2 + ' use').getAttribute('href');
    return currentStoneState == adjacentStoneState;
  }

  let stoneExists = (indices) => {
    if (placedStones.find((elem) => elem == indices) == undefined) return false;
    return true;
  }

  let stoneTraversed = (indices) => {
    if (traversedStones.find((elem) => elem == indices) == undefined) return false;
    return true;
  }

  let placeable2 = (clickSquareID) => {
    let indices = /^.*(\d+.*\d+)$/.exec(clickSquareID)[1];
    console.log('placeable2: ' + indices);
    let groups = adjMap.get(indices);
    console.log(groups);
    let groupNumber;
    if (groups != null) {
      let sameColorGroups = getSameColorGroups(groups);
      if (groups.length == 4) {
        if (sameColorGroups.length > 0) {
          for (let sameColorGroup of sameColorGroups) {
            if (exposedOrCapturable(sameColorGroup)) { // also does 'capturing'; 'capturing' adds new adj
              groupNumber = consolidate(indices);
              updateAdj(indices, groupNumber);
              adjMap.delete(indices);
              return true;
            }
          }
        }
        return false;
      } else {
        if (sameColorGroups.length == 0) groupNumber = makeNewStoneGroup(indices);
        else groupNumber = consolidate(indices);
      }
    } else {
      groupNumber = makeNewStoneGroup(indices);
    }
    updateAdj(indices, groupNumber);
    adjMap.delete(indices);
    return true;
  }

  let getSameColorGroups = (groups) => {
    groups.filter((group) => {
      let stoneID = stoneGroups.get(group)[0];
      return sameColor(stoneID);

    });
  }

  let sameColor = (stoneID) => {
    let color = document.querySelector('#clickSquareID_' + stoneID + ' use').getAttribute('href');
    if (color == '#plain-black-14.5-3' && turn == 'black') return true;
    else if (color == '#plain-white-14.5-2' && turn == 'white') return true;
    else return false;
  }

  let consolidate = (indices) => { // consolidate sameColorGroups in adj and stoneGroups
    let [x, y] = indices.split('_').map((val) => parseInt(val, 10));
    let adjacentGroups = getSameColorAdjacentGroups(indices);
    if (x - 1 > -1) {
      if (!adjMap.has((x - 1) + '_' + y)) adjMap.set((x - 1) + '_' + y, [groupIndex]);
      else if (!adjMap.get(x - 1 + '_' + y).includes(groupIndex)) adjMap.set((x - 1) + '_' + y, [adjMap.get((x - 1) + '_' + y), groupIndex]);
    }
    if (x + 1 < 9) {
      if (!adjMap.has((x + 1) + '_' + y)) adjMap.set((x + 1) + '_' + y, [groupIndex]);
      else if (!adjMap.get((x + 1) + '_' + y).includes(groupIndex)) adjMap.set((x + 1) + '_' + y, [adjMap.get((x + 1) + '_' + y), groupIndex]);
    }
    if (y - 1 > -1) {
      if (!adjMap.has(x + '_' + (y - 1))) adjMap.set(x + '_' + (y - 1), [groupIndex]);
      else if (!adjMap.get(x + '_' + (y - 1)).includes(groupIndex)) adjMap.set(x + '_' + (y - 1), [adjMap.get(x + '_' + (y - 1)), groupIndex]);
    }
    if (y + 1 < 9) {
      if (!adjMap.has(x + '_' + (y + 1))) adjMap.set(x + '_' + (y + 1), [groupIndex]);
      else if (!adjMap.get(x + '_' + (y + 1)).includes(groupIndex)) adjMap.set(x + '_' + (y + 1), [adjMap.get(x + '_' + (y + 1)), groupIndex]);
    }
  }

  let getSameColorAdjacentGroups = (x, y) => {
    return adjMap.get(indices).filter((group)=>sameColor(stoneGroups.get(group)[0]));
  }

  let updateAdj = (indices, groupNumber) => {
    let [x, y] = indices.split('_').map((val) => parseInt(val, 10));
    // if no stone found; also append
    setAdj(x - 1 + '_' + y, groupNumber); // update adj
    setAdj(x + 1 + '_' + y, groupNumber);
    setAdj(x - 1 + '_' + y - 1, groupNumber);
    setAdj(x - 1 + '_' + y + 1, groupNumber);
  }

  let setAdj = (indices, groupNumber) => {
    if (placedStones.find(indices) == undefined) {
      if (!adjMap.has(indices)) {
        adjMap.set(indices, groupNumber);
      } else if (!adjMap.get(indices).includes(groupNumber)) {
        adjMap.set(indices, [...adjMap.get(indices), groupNumber]);
      }
    }
  }

  let makeNewStoneGroup = (indices) => {
    let groupNumber = Math.max(...stoneGroups.keys()) + 1;
    if (groupNumber == -Infinity) groupNumber = 1;
    stoneGroups.set(groupNumber, [indices]);
    return groupNumber;
  }

  let alignColors = (clickSquareID) => {
    if (turn == 'white') document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-white-14.5-2');
    else document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-black-14.5-3');
  }

  let swapTurn = () => {
    if (turn == 'white') turn = 'black';
    else turn = 'white';
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
            <g id="plain-black-14.5-187" className="stone">
              <circle stroke="hsl(8, 7%, 20%)" strokeWidth="0.7px" cx="43" cy="43" r="14.1375" shapeRendering="geometricPrecision" fill="url(#plain-black-14.5-187-gradient)"></circle>
              <defs>
                <linearGradient x1="0.40" y1="0.10" x2="0.70" y2="0.70" id="plain-black-14.5-187-gradient">
                  <stop offset="0%" stopColor="hsl(8, 7%, 27%)"></stop>
                  <stop offset="100%" stopColor="hsl(8, 7%, 12%)"></stop>
                </linearGradient>
              </defs>
            </g>
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
