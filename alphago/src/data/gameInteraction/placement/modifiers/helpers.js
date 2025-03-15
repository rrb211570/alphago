import { store } from "../../../../store/store";

let getNeighborIndices = (rootIndices) => {
    let [x, y] = /^.*(\d+).*(\d+)$/.exec(rootIndices).slice(1, 3).map((val) => parseInt(val, 10));
    let possibleNeighbors = [];
    console.log(rootIndices);
    if (x + 1 < 9) possibleNeighbors.push((x + 1) + '_' + y);
    if (x - 1 > -1) possibleNeighbors.push((x - 1) + '_' + y);
    if (y + 1 < 9) possibleNeighbors.push(x + '_' + (y + 1));
    if (y - 1 > -1) possibleNeighbors.push(x + '_' + (y - 1));
    return possibleNeighbors;
}

let getNeighborStones = (rootIndices) => {
    let placedStones = store.getState().gamePlay.placedStones;
    let [x, y] = /^.*(\d+).*(\d+)$/.exec(rootIndices).slice(1, 3).map((val) => parseInt(val, 10));
    let possibleNeighbors = [];
    console.log(rootIndices);
    if (x + 1 < 9 && placedStones.includes((x + 1) + '_' + y)) possibleNeighbors.push((x + 1) + '_' + y);
    if (x - 1 > -1 && placedStones.includes((x - 1) + '_' + y)) possibleNeighbors.push((x - 1) + '_' + y);
    if (y + 1 < 9 && placedStones.includes(x + '_' + (y + 1))) possibleNeighbors.push(x + '_' + (y + 1));
    if (y - 1 > -1 && placedStones.includes(x + '_' + (y - 1))) possibleNeighbors.push(x + '_' + (y - 1));
    return possibleNeighbors;
}

export { getNeighborIndices, getNeighborStones };