class BaseModel {
    // constructor
    constructor() {
        this.api = ""
        this.id = null
        this.data = {}
        this.hash = null
    }

    // Setter
    update(data) {
        this.data = data
    }
}

export default BaseModel
