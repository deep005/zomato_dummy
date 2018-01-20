let createURL = function (position) {
    let esc = encodeURIComponent;
    return new Promise(function (resolve) {
        resolve(Object.keys(position)
            .map(function (k) {
                return esc(k) + '=' + esc(position[k])
            }).join('&'))
    })
};
function getHotelDetails(hotelsSearchObj){
    let url;
    return new Promise((resolve, reject) => {
        createURL(hotelsSearchObj).then((query)=> {
            url = 'https://developers.zomato.com/api/v2.1/search?' + query;
            return url;
        }).then((url) => {
            console.log(url);
            fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'user-key': '3ee96372b5c0235a94ca049acad2ea71',
                    'content-type': 'application/json'
                })
            }).then((res) => {
                var data =res.json();
                resolve(data);
            }).catch((err) => {
                reject(err);
            })
        });
    })
}
module.exports = {getHotelDetails};