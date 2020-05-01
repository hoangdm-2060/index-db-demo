const idbApp = (function () {
    'use strict';

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
    }
    const dbPromise = idb.open('products', 5, function (upgradeDb) {
        switch (upgradeDb.oldVersion) {
            case 0:
            //chạy nếu db không tồn tại
            case 1:
                console.log('Creating the furniture object store');
                upgradeDb.createObjectStore('furniture', {keyPath: 'id'});
            case 2:
                console.log('Creating a name index');
                const store = upgradeDb.transaction.objectStore('furniture');
                store.createIndex('name', 'name', {unique: true});
            case 3:
                console.log('Creating a price index');
                const storeV1 = upgradeDb.transaction.objectStore('furniture');
                storeV1.createIndex('price', 'price', {unique: true});
            case 4:
                console.log('Creating a description index');
                const storeV2 = upgradeDb.transaction.objectStore('furniture');
                storeV2.createIndex('description', 'description', {unique: true});
        }
    });

    function addProducts() {
        alert(1);
        dbPromise.then(function (db) {
            const tx = db.transaction('furniture', 'readwrite');
            const store = tx.objectStore('furniture');
            const items = [
                {
                    name: 'Couch',
                    id: 'cch-blk-ma',
                    price: 499.99,
                    color: 'black',
                    material: 'mahogany',
                    description: 'A very comfy couch',
                    quantity: 3
                },
                {
                    name: 'Armchair',
                    id: 'ac-gr-pin',
                    price: 299.99,
                    color: 'grey',
                    material: 'pine',
                    description: 'A plush recliner armchair',
                    quantity: 7
                },
                {
                    name: 'Stool',
                    id: 'st-re-pin',
                    price: 59.99,
                    color: 'red',
                    material: 'pine',
                    description: 'A light, high-stool',
                    quantity: 3
                },
                {
                    name: 'Chair',
                    id: 'ch-blu-pin',
                    price: 49.99,
                    color: 'blue',
                    material: 'pine',
                    description: 'A plain chair for the kitchen table',
                    quantity: 1
                },
                {
                    name: 'Dresser',
                    id: 'dr-wht-ply',
                    price: 399.99,
                    color: 'white',
                    material: 'plywood',
                    description: 'A plain dresser with five drawers',
                    quantity: 4
                },
                {
                    name: 'Cabinet',
                    id: 'ca-brn-ma',
                    price: 799.99,
                    color: 'brown',
                    material: 'mahogany',
                    description: 'An intricately-designed, antique cabinet',
                    quantity: 11
                }
            ];
            return Promise.all(items.map(function (item) {
                    console.log('Adding item: ', item);
                    return store.add(item);
                })
            ).catch(function (e) {
                tx.abort();
                console.log(e);
            }).then(function () {
                console.log('All items added successfully!');
            });
        });

    }

    function getByName(key) {
        return dbPromise.then(function (db) {
            const tx = db.transaction('furniture', 'readonly');
            const store = tx.objectStore('furniture');
            const index = store.index('name');

            return index.get(key);
        });

    }

    function getByPrice() {

        var lower = document.getElementById('priceLower').value;
        var upper = document.getElementById('priceUpper').value;
        var lowerNum = Number(document.getElementById('priceLower').value);
        var upperNum = Number(document.getElementById('priceUpper').value);

        if (lower === '' && upper === '') {
            return;
        }
        var range;
        if (lower !== '' && upper !== '') {
            range = IDBKeyRange.bound(lowerNum, upperNum);
        } else if (lower === '') {
            range = IDBKeyRange.upperBound(upperNum);
        } else {
            range = IDBKeyRange.lowerBound(lowerNum);
        }
        var s = '';
        dbPromise.then(function (db) {
            var tx = db.transaction('furniture', 'readonly');
            var store = tx.objectStore('furniture');
            var index = store.index('price');
            return index.openCursor(range);
        }).then(function showRange(cursor) {
            if (!cursor) {
                return;
            }
            console.log('Cursored at:', cursor.value.name);
            s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
            for (var field in cursor.value) {
                s += field + '=' + cursor.value[field] + '<br/>';
            }
            s += '</p>';
            return cursor.continue().then(showRange);
        }).then(function () {
            if (s === '') {
                s = '<p>No results.</p>';
            }
            document.getElementById('results').innerHTML = s;
        });

    }

    function getByDesc() {
        var key = document.getElementById('desc').value;
        if (key === '') {
            return;
        }
        var range = IDBKeyRange.only(key);
        var s = '';
        dbPromise.then(function (db) {
        }).then(function () {
            if (s === '') {
                s = '<p>No results.</p>';
            }
            document.getElementById('results').innerHTML = s;
        });
    }

    function displayByName() {
        var key = document.getElementById('name').value;
        if (key === '') {
            return;
        }
        var s = '';
        getByName(key).then(function (object) {
            console.log(object);
            if (!object) {
                return;
            }

            s += '<h2>' + object.name + '</h2><p>';
            for (var field in object) {
                s += field + ' = ' + object[field] + '<br/>';
            }
            s += '</p>';

        }).then(function () {
            if (s === '') {
                s = '<p>No results.</p>';
            }
            document.getElementById('results').innerHTML = s;
        });
    }

    return {
        dbPromise: (dbPromise),
        addProducts: (addProducts),
        getByName: (getByName),
        displayByName: (displayByName),
        getByPrice: (getByPrice),
        getByDesc: (getByDesc),
    };
})();

