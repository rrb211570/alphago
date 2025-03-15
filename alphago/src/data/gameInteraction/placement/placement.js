// import placedStones, turn, adjMap, stoneGroups
import { store } from "../../../store/store.js";
import { updateAdj, deleteAdj, updateStoneGroups } from '../../../store/reducers/gamePlaySlice.js'
import { getNeighborIndices, getNeighborStones } from "./modifiers/helpers.js";
import capturable from "./modifiers/capturable.js";

let placeable = (clickSquareID) => {
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  let indices = /^.*(\d+.*\d+)$/.exec(clickSquareID)[1];
  console.log('placeable: ' + indices);
  let groups = adjMap.getAdj(indices);
  let groupNumber;
  if (groups != null) {
    let sameColorGroups = getSameColorAdjacentGroups(groups);
    if (getNeighborStones(indices).length == getNeighborIndices(indices).length) {
      if (sameColorGroups.length > 0) {
        console.log('surrounded, checking exposedOrCapturable');
        for (let sameColorGroup of sameColorGroups) {
          if (exposed(sameColorGroup, indices)) {
            console.log('exposed: ' + sameColorGroup);
            groupNumber = consolidate(indices);
            addNeighborAdj(indices, groupNumber);
            store.dispatch(deleteAdj({ indices }));
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
  addNeighborAdj(indices, groupNumber);
  store.dispatch(deleteAdj({ indices }));
  console.log(stoneGroups);
  console.log(adjMap);
  console.log(store.getState().gamePlay.placedStones);
  return true;
}

// also does 'capturing'; 'capturing' adds new adj
let exposed = (sameColorGroup, rootIndices) => {
  let adjMap = store.getState().gamePlay.adjMap;
  for (let [indices, adjArr] of adjMap.getAdjEntries()) {
    if (indices != rootIndices && adjArr.includes(sameColorGroup)) return true;
  }
  return false;
}

let addNeighborAdj = (indices, groupNumber) => {
  let [x, y] = indices.split('_').map((val) => parseInt(val, 10));
  // if no stone found; also append
  for (let neighbor of getNeighborIndices(indices)) {
    let placedStones = store.getState().gamePlay.placedStones;
    let adjMap = store.getState().gamePlay.adjMap;
    if (!placedStones.includes(neighbor)) {
      if (!adjMap.hasAdj(neighbor)) {
        adjMap.setAdj(neighbor, [groupNumber])
        store.dispatch(updateAdj({ adjMap }));
      } else if (!adjMap.getAdj(neighbor).includes(groupNumber)) {
        adjMap.setAdj(neighbor, [...adjMap.getAdj(neighbor), groupNumber])
        store.dispatch(updateAdj({ adjMap }));
      }
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

let consolidate = (indices) => { // consolidate sameColorGroups in adj and stoneGroups
  let adjMap = store.getState().gamePlay.adjMap;
  let stoneGroups = store.getState().gamePlay.stoneGroups;
  console.log('consolidate ' + indices);
  let [x, y] = indices.split('_').map((val) => parseInt(val, 10));

  let sameColorAdjacentGroups = getSameColorAdjacentGroups(adjMap.getAdj(indices));
  let primaryGroupNumber = sameColorAdjacentGroups[0];
  let consolidatedStoneGroup = [...stoneGroups.getStoneGroup(primaryGroupNumber)];

  console.log(sameColorAdjacentGroups);
  console.log('primaryGroupNumber: ' + primaryGroupNumber);
  console.log(consolidatedStoneGroup);

  for (let groupNumber of sameColorAdjacentGroups) {
    if (groupNumber != primaryGroupNumber) { // consolidate groupNumber adj and stoneGroups into primaryGroupNumber
      for (let [adj, adjArr] of adjMap.getAdjEntries()) { // consolidate adjMap
        if (adjArr.includes(groupNumber)) {
          let index = adjArr.indexOf(groupNumber);
          if (adjArr.includes(primaryGroupNumber)) { // remove stale groupNumber, primary already exists
            adjArr.splice(index, 1)
            adjMap.setAdj(adj, adjArr);
            store.dispatch(updateAdj({ adjMap }));
          } else { // remove stale groupNumber, add primary
            adjArr.splice(index, 1)
            adjMap.setAdj(adj, [...adjArr, primaryGroupNumber]);
            store.dispatch(updateAdj({ adjMap }));
          }
        }
      } // consolidate stoneGroups
      consolidatedStoneGroup.push(...stoneGroups.getStoneGroup(groupNumber));
      stoneGroups.deleteStoneGroup(groupNumber);
      sameColorAdjacentGroups.splice(sameColorAdjacentGroups.indexOf(groupNumber), 1);
    }
  }
  console.log(consolidatedStoneGroup);
  stoneGroups.setStoneGroup(primaryGroupNumber, [...consolidatedStoneGroup, indices]);
  store.dispatch(updateStoneGroups({ stoneGroups }));
  return primaryGroupNumber;
}

let getSameColorAdjacentGroups = (groups) => {
  return groups.filter((group) => sameColor(store.getState().gamePlay.stoneGroups.getStoneGroup(group)[0]));
}

let sameColor = (stoneID) => {
  let turn = store.getState().gamePlay.turn;
  let color = document.querySelector('#clickSquare_' + stoneID + ' use').getAttribute('href');
  if (color == '#plain-black-14.5-3' && turn == 'black') return true;
  else if (color == '#plain-white-14.5-2' && turn == 'white') return true;
  return false;
}

export default placeable;