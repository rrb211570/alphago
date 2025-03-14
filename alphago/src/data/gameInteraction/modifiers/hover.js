// import turn from store
import { store } from '../../../store/store.js'

let alignColors = (clickSquareID) => {
    if (store.getState().gamePlay.turn == 'white') document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-white-14.5-2');
    else document.querySelector('#' + clickSquareID + ' use').setAttribute('href', '#plain-black-14.5-3');
}

export { alignColors }