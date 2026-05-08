// Helpers de normalización
    function normalize(str){
        if(!str) return '';
        return str?.trim().replace(/\s+/g, ' ') || '';
    }

    function normalizeEmail(email) {
        if(!email) return '';
        return email?.toLowerCase().trim() || ''; 
    }

    function normalizeNickname(nickname) {
        if(!nickname) return `${Date.now()}${btoa(this.name || this.last_name)}`
        return  nickname.toLowerCase();
    }

module.exports = {
    normalize,
    normalizeEmail,
    normalizeNickname
}