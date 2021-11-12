import {uploadCad} from './cad.upload'
import {decodeCad} from './cad.decode';

class Cad {
    constructor() {
    }

    decode() {
        decodeCad.call(this)
    }

    upload(info) {
        uploadCad.call(this, info)
    }
}

export default Cad
