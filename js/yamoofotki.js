var YaMooFotki = new Class({
         Implements: [Events],    // Asset
         initialize: function(){
                this.apiHost = 'http://api-fotki.yandex.ru';
                this.apiPath = '/api/';
                //this.jsontimeout = 1200;
                var that = this;
                this.albums_data = {};
                this.album_sort_type = 'updated';
         },
         init: function()
         {

         },
         setUsername: function(username) {
                this.username = username;
         },
         setOAuthToken: function(token) {
                // Зарезирвированно для дальнешего использования
                this.token = token;
         },
         setFormat: function(format) {
                this.format=format;
         },
         albums: function(onOk,onErr) {
                        var that = this;
                        this.request('albums/', function(data) {
                                                that.fireEvent('albums',data);
                                                that.albums_data = data;
                                                onOk(data);
                                        },function(data) {
                                                that.fireEvent('albums',data);
                                                onErr();
                                        });

         },
         getIdFromString: function(alb_id)
         {
               if (typeof(alb_id)=='string') {
                   if (alb_id.indexOf('urn:') > -1) {
                           alb_id = alb_id.substr(alb_id.lastIndexOf(':')+1);
                    }
                    alb_id = parseInt(alb_id);
                }
                return alb_id;
             
         },
         getAlbumData: function(alb_id)
         {
                alb_id = this.getIdFromString(alb_id);
                for(var i=0;i<this.albums_data.entries.length;i++) {
                    var id =this.albums_data.entries[i].id;
                    var cur_alb_id = this.getIdFromString(id)
                    if (cur_alb_id == alb_id) {
                        
                        return this.albums_data.entries[i];
                    }
                }      
         },
         album: function(alb_id,from,limit,onOk,onErr)
         {
                alb_id = this.getIdFromString(alb_id);
                if (!isNaN(alb_id)) {
                        //------------------------
                        var alb_data = this.getAlbumData(alb_id);
                        //console.log(alb_data);
                        //------------------------
                        var url_str = 'album/'+alb_id+'/photos/'+this.album_sort_type;
                            if (from !=''){
                                url_str +=';'+from+'';    
                            }
                            if (limit != '') {
                                url_str +='/?limit='+limit;
                            }
                        this.request(url_str,onOk,onErr)
                } else {
                        onErr();
                }
         },
         photo: function(photo_id,onOk,onErr)
         {
            photo_id = this.getIdFromString(photo_id);
            if (!isNaN(photo_id)) {
                var url_str = 'photo/'+photo_id+'/';
                this.request(url_str,onOk,onErr)
            } else {
                onErr();
            }
         },
         request: function(res,onOk,onErr) {
                var that = this;
                var addParametrs = 'format='+this.format+'&oauth_token='+this.token
                if (res.indexOf('?') > -1) {
                    res = res+'&'+addParametrs
                } else {
                    res = res+'?'+addParametrs
                }
                var url_str = this.apiHost + this.apiPath +'users/'+this.username+'/'+res;
                new Request.JSONP({
                  url: url_str,
                onComplete: function(jsonObj) {
                     onOk(jsonObj);
                     that.fireEvent('requestComplete');

                },
                onCancel: function() { onErr(); that.fireEvent('requestError');  },
                onTimeout: function() { onErr(); that.fireEvent('requestError');  }
                }).send();
         }
});

