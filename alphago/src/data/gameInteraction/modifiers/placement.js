// import placedStones, turn, adjMap, stoneGroups
import { store } from "../../../store/store";
import { updateAdj, deleteAdj, updateStoneGroups } from '../../../store/reducers/gamePlaySlice.js'

let getNeighborIndices = (rootIndices) => {
  let [x, y] = /^.*(\d+).*(\d+)$/.exec(rootIndices).slice(1, 3);
  let possibleNeighbors = [];
  if (x + 1 < 9) possibleNeighbors.push((x + 1) + '_' + y);
  if (x - 1 > -1) possibleNeighbors.push((x - 1) + '_' + y);
  if (y + 1 < 9) possibleNeighbors.push(x + '_' + (y + 1));
  if (y - 1 > -1) possibleNeighbors.push(x + '_' + (y - 1));
  return possibleNeighbors;
}

let stoneExists = (indices) => {
  if (store.getState().gamePlay.placedStones.find((elem) => elem == indices) == undefined) return false;
  return true;
}

let placeable = (clickSquareID) => {
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  let indices = /^.*(\d+.*\d+)$/.exec(clickSquareID)[1];
  console.log('placeable: ' + indices);
  console.log(adjMap);
  let groups = adjMap.getAdj(indices);
  let groupNumber;
  if (groups != null) {
    let sameColorGroups = getSameColorGroups(groups);
    if (groups.length == getNeighborIndices.length()) {
      if (sameColorGroups.length > 0) {
        console.log('surrounded, checking exposedOrCapturable');
        for (let sameColorGroup of sameColorGroups) {
          if (exposed(sameColorGroup, indices)) {
            console.log('exposed: ' + sameColorGroup);
            groupNumber = consolidate(indices);
            addNewAdj(indices, groupNumber);
            store.dispatch(deleteAdj({ indices: indices }));
            return true;
          }
        }
        // if (capturable(indices)) return true;
        return false;
      }
      console.log('surrounded, all different colors')
      return false;
    } else {
      console.log('not completely surrounded, newStoneGroup or consolidate');
      if (sameColorGroups.length == 0) groupNumber = makeNewStoneGroup(indices);
      else groupNumber = consolidate(indices);
    }
  } else {
    console.log('completely exposed, newStoneGroup')
    groupNumber = makeNewStoneGroup(indices);
  }
  addNewAdj(indices, groupNumber);
  adjMap = store.getState().gamePlay.adjMap;
  adjMap.deleteAdj(indices);
  store.dispatch(deleteAdj({ adjMap }));
  console.log(stoneGroups);
  console.log(adjMap);
  console.log(store.getState().gamePlay.placedStones);
  return true;
}

let getSameColorGroups = (groups) => {
  return groups.filter((group) => { return sameColor(store.getState().gamePlay.stoneGroups.getStoneGroup(group)[0]) });
}

let sameColor = (stoneID) => {
  let turn = store.getState().gamePlay.turn;
  let color = document.querySelector('#clickSquare_' + stoneID + ' use').getAttribute('href');
  if (color == '#plain-black-14.5-3' && turn == 'black') return true;
  else if (color == '#plain-white-14.5-2' && turn == 'white') return true;
  return false;
}

// also does 'capturing'; 'capturing' adds new adj
let exposed = (sameColorGroup, rootIndices) => {
  let adjMap = store.getState().gamePlay.adjMap;
  for (let [indices, adjArr] of adjMap.getAdjEntries()) {
    if (indices != rootIndices && adjArr.includes(sameColorGroup)) return true;
  }
  return false;
}

let consolidate = (indices) => { // consolidate sameColorGroups in adj and stoneGroups
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  console.log('consolidate ' + indices);
  let [x, y] = indices.split('_').map((val) => parseInt(val, 10));

  let sameColorAdjacentGroups = getSameColorAdjacentGroups(indices);
  let primaryGroupNumber = sameColorAdjacentGroups[0];
  let consolidatedStoneGroup = [...stoneGroups.getStoneGroup(primaryGroupNumber)];

  console.log(sameColorAdjacentGroups);
  console.log('primaryGroupNumber: ' + primaryGroupNumber);
  console.log(consolidatedStoneGroup);

  for (let groupNumber of sameColorAdjacentGroups) {
    if (groupNumber != primaryGroupNumber) { // consolidate groupNumber adj and stoneGroups into primaryGroupNumber
      for (let adj of adjMap.getAdjKeys()) { // consolidate adjMap
        let adjArr = adjMap.getAdj(adj);
        if (adjArr.includes(groupNumber)) {
          console.log(adjArr);
          let index = adjArr.indexOf(groupNumber);
          if (adjArr.includes(primaryGroupNumber)) { // remove stale groupNumber, primary already exists
            console.log(adjArr);
            adjMap.setAdj(adj, adjArr.splice(index, 1));
            store.dispatch(updateAdj({ adjMap }));
          } else { // remove stale groupNumber, add primary
            console.log(adjArr);
            console.log([...adjArr.splice(index, 1), primaryGroupNumber]);
            adjMap.setAdj(adj, [...adjArr.splice(index, 1), primaryGroupNumber]);
            store.dispatch(updateAdj({ adjMap }));
          }
        }
      } // consolidate stoneGroups
      consolidatedStoneGroup.push(...stoneGroups.getStoneGroup(groupNumber));
      stoneGroups.deleteStoneGroup(groupNumber);
    }
    console.log(consolidatedStoneGroup);
  }
  stoneGroups.setStoneGroup(primaryGroupNumber, [...consolidatedStoneGroup, indices]);
  store.dispatch(updateStoneGroups({ stoneGroups }));
  return primaryGroupNumber;
}

let getSameColorAdjacentGroups = (indices) => {
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  console.log('sameColorAdjacentGroups');
  let sameColorAdjacentGroups = adjMap.getAdj(indices).filter((group) => sameColor(stoneGroups.getStoneGroup(group)[0]));
  console.log(sameColorAdjacentGroups);
  return adjMap.getAdj(indices).filter((group) => sameColor(stoneGroups.getStoneGroup(group)[0]));
}

let addNewAdj = (indices, groupNumber) => {
  let [x, y] = indices.split('_').map((val) => parseInt(val, 10));
  // if no stone found; also append
  for(let neighbor of getNeighborIndices(indices)) newAdj(neighbor, groupNumber); //update adj
}

let newAdj = (indices, groupNumber) => {
  let placedStones = store.getState().gamePlay.placedStones;
  let adjMap = store.getState().gamePlay.adjMap;
  if (!placedStones.includes(indices)) {
    console.log('setAdj ' + indices + ' ' + groupNumber);
    if (!adjMap.hasAdj(indices)) {
      adjMap.setAdj(indices, [groupNumber])
      store.dispatch(updateAdj({ adjMap }));
    } else if (!adjMap.getAdj(indices).includes(groupNumber)) {
      adjMap.setAdj(indices, [...adjMap.getAdj(indices), groupNumber])
      store.dispatch(updateAdj({ adjMap }));
    }
  }
}

let makeNewStoneGroup = (indices) => {
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  let groupNumber = Math.max(...stoneGroups.getStoneGroupKeys()) + 1;
  if (groupNumber == -Infinity) groupNumber = 1;
  stoneGroups.setStoneGroup(groupNumber, [indices]);
  store.dispatch(updateStoneGroups({ stoneGroups }));
  return groupNumber;
}

export { stoneExists, placeable };