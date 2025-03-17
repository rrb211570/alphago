import { store } from "../../../../store/store";
import { updateStoneGroups } from "../../../../store/reducers/gamePlaySlice";

let getAllNeighborIndices = (rootIndices) => {
    let [x, y] = /^(\d+).*(\d+)$/.exec(rootIndices).slice(1, 3).map((val) => parseInt(val, 10));
    let neighborIndices = [];
    if (x + 1 < 9) neighborIndices.push((x + 1) + '_' + y);
    if (x - 1 > -1) neighborIndices.push((x - 1) + '_' + y);
    if (y + 1 < 9) neighborIndices.push(x + '_' + (y + 1));
    if (y - 1 > -1) neighborIndices.push(x + '_' + (y - 1));
    return neighborIndices;
}

let getNeighborStones = (rootIndices) => {
    let placedStones = store.getState().gamePlay.placedStones;
    let [x, y] = /^(\d+).*(\d+)$/.exec(rootIndices).slice(1, 3).map((val) => parseInt(val, 10));
    let neighborStones = [];
    if (x + 1 < 9 && placedStones.includes((x + 1) + '_' + y)) neighborStones.push((x + 1) + '_' + y);
    if (x - 1 > -1 && placedStones.includes((x - 1) + '_' + y)) neighborStones.push((x - 1) + '_' + y);
    if (y + 1 < 9 && placedStones.includes(x + '_' + (y + 1))) neighborStones.push(x + '_' + (y + 1));
    if (y - 1 > -1 && placedStones.includes(x + '_' + (y - 1))) neighborStones.push(x + '_' + (y - 1));
    return neighborStones;
}

let makeNewStoneGroup = (indices) => {
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    let newGroupNumber = Math.max(...stoneGroups.getStoneGroupKeys()) + 1;
    if (newGroupNumber == -Infinity) newGroupNumber = 1;
    stoneGroups.setStoneGroup(newGroupNumber, [indices]);
    store.dispatch(updateStoneGroups({ stoneGroups }));
}

let getNeighborGroups = (rootIndices)=>{
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    let neighborGroups = [];
    for (let neighborIndices of getAllNeighborIndices(rootIndices)) {
        for (let [stoneGroupNumber, stones] of stoneGroups.getStoneGroupEntries()) {
            if (stones.includes(neighborIndices) && !neighborGroups.includes(stoneGroupNumber)) neighborGroups.push(stoneGroupNumber);
        }
    }
    return neighborGroups;
}

let getSameColorNeighborGroups = (rootIndices) => {
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    return getNeighborGroups(rootIndices).filter((group) => sameColorAsTurn(stoneGroups.getStones(group)[0]));
}

let sameColorAsTurn = (stoneID) => {
    let turn = store.getState().gamePlay.turn;
    let color = document.querySelector('#clickSquare_' + stoneID + ' use').getAttribute('href');
    console.log(color);
    console.log(turn);
    if (color == '#plain-black-14.5-3' && turn == 'black') return true;
    else if (color == '#plain-white-14.5-2' && turn == 'white') return true;
    return false;
}

let getStoneGroupFromStone = (indices) => {
    let stoneGroups = store.getState().gamePlay.stoneGroups;
    for (let [groupNumber, stoneArr] of stoneGroups.getStoneGroupEntries()) {
      if (stoneArr.includes(indices)) return groupNumber;
    }
    throw 'getStoneGroup:: stoneGroups does not contain ' + indices;
  }

export { getAllNeighborIndices, getNeighborStones, makeNewStoneGroup, getNeighborGroups, getSameColorNeighborGroups, getStoneGroupFromStone };