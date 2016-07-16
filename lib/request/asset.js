import { fileMissing,
         writeFile,
         writeManager,
         writeFileWithDownload   } from '../file-system/file';
import { patchAsset } from '../patch';
import _ from 'lodash';
import Promise from 'promise';

export function getAsset (_owner, _asset, action) {
  return new Promise(function (resolve, reject) {
    _owner.insales.getAsset({
      token: _owner.options.token,
      url: _owner.options.url,
      theme: _owner.options.theme,
      assetId: _asset.id
    }).then(response => {
      var dataReponse = response.data.asset;
      var _contents = dataReponse.content
      var _uri = 'http://' + _owner.options.url + dataReponse.asset_url;
      const _status = fileMissing(_asset.path)

      _status.then(function () {
        action.rewrite = true;
        writeManager(_asset, _uri, dataReponse, action, _owner, resolve(response.data.asset));
      }, function () {
        if (_owner.options.update) {
          action.rewrite = true;
          writeManager(_asset, _uri, dataReponse, action, _owner, resolve(response.data.asset));
        }else{
          if (_owner.options.backup) {
            action.rewrite = false;
            writeManager(_asset, _uri, dataReponse, action, _owner, resolve(response.data.asset));
          }else{
            reject(response.data.asset)
          }
        }
      })
    }).catch(err => {
      console.error('error: ' + _asset.name, err.url);
      reject(err.msg)
    });

  });
}


export function getAssets (_owner, action) {
  return new Promise(function (resolve, reject){
    var _size = _.size(_owner.downloadList);
    var _count = 0;
    recursionDownload(_owner, _count, _size, action)
  });
}


function recursionDownload(_owner, count, size, action) {
  setTimeout(function () {
    getAsset(_owner, _owner.downloadList[count], action).then(function (_asset) {
      ++count
      if (count === size) {
        resolve()
      }else{
        return recursionDownload(_owner, count, size, action)
      }
    }, function (_asset) {
      ++count
      if (count === size) {
        resolve()
      }else{
        return recursionDownload(_owner, count, size, action)
      }
    })
  }, 300)
}

export function upadeteAssets(_owner) {
  return new Promise(function (resolve, reject) {
    _owner.insales.listAsset({
      token: _owner.options.token,
      url: _owner.options.url,
      theme: _owner.options.theme
    }).then(response => {
      var _assets = response.data.assets.asset;
      patchAsset(_owner, _assets).then(function () {
        resolve()
      })
    }).catch(err => {
      console.info(err.msg);
      reject(err.msg);
    });
  });
}

export function uploadAsset (_owner, asset, _path) {
  return new Promise(function (resolve, reject) {
    _owner.insales.uploadAsset({
      token: _owner.options.token,
      url: _owner.options.url,
      theme: _owner.options.theme,
      asset
    }).then(output => {
      console.info('Upload ' + asset.type + ': '+ asset.name + ' from ' + _path);
      resolve()
    }).catch(err => {
      console.error(asset, err.msg);
      reject()
    });
  });
}

export function removeAsset (_owner, assetId, path, name) {
  return new Promise(function (resolve, reject) {
    _owner.insales.removeAsset({
      token: _owner.options.token,
      url: _owner.options.url,
      theme: _owner.options.theme,
      assetId: assetId,
    }).then(output => {
      delete _owner.assets[name];
      console.info('Remove: ' + path);
      resolve()
    }).catch(err => {
      console.error(name, assetId, err.msg);
      reject()
    });
  });
}

export function editAsset (_owner, _asset, assetId, path) {
  _owner.insales.editAsset({
    token: _owner.options.token,
    url: _owner.options.url,
    theme: _owner.options.theme,
    assetId: assetId,
    asset: _asset
  }).then(output => {
    console.info('edit: ' + path);
  }).catch(err => {
    console.error(err.msg);
  });
}