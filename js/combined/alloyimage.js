/*
 * @author:Bin Wang
 * @description: Main
 *
 */

//ɾ������Ԫ��   arrΪ�����±� 
Array.prototype.del = function(arr){

    //��������������
    arr.sort();

    //�������飬��ֹ��Ⱦ
    var b = this.concat([]);
    for(var i = arr.length - 1; i >= 0; i --){
        b = b.slice(0, arr[i]).concat(b.slice(arr[i] + 1));
    }

    return b;
};

//��ͼ�������ӳ��μ��زŴ����¼�������������
HTMLImageElement.prototype.loadOnce = function(func){
   var i = 0;
   this.onload = function(){
        if(!i) func.call(this, null);
        i ++;
   };
};

;(function(Ps){

    //�����ж������õ�һ������,��̬����,������ģ��
    var P = {

        //ģ���
        lib: [],

        //��ʼ��׼��
        init: function(){
            this.require("config");
        },

        //ģ��ע�᷽��
        module: function(name, func){
            this.lib[name] = func.call(null, this);
        },

        //�����ļ�
        require: function(name){
            var _this = this;
            var scriptLoader = document.createElement("script");

            document.body.appendChild(scriptLoader);
            scriptLoader.src = "./js/module/" + name + ".js";
            scriptLoader.onload = scriptLoader.onerror = function(e){
                _this.handlerror(e);
            }
        },

        //��������
        handlerror: function(e){
            //this.destroySelf("������δ֪ԭ���ж�");
        },

        //��������ɱ��ɱǰ����������
        destroySelf: function(msg){
            delete window[Ps];
            var e = new Error(msg);
            throw(e);
        },

        //ӳ����,�����ķ�����...ӳ��Ϊʵ�ʷ���
        reflect: function(method, imgData, args){

            //�õ�ʵ�ʵ�ģ������
            var moduleName = this.lib.config.getModuleName(method);

            //����ʵ�ʴ������ݵ�Ԫ����
            return this.lib[moduleName].process(imgData, args);
        },

        //���Ч��ӳ����
        reflectEasy: function(effect){
            var fun = this.lib.config.getEasyFun(effect);
            return this.lib.easy.getFun(fun);
        },

        //�ϲ�һ��ͼ�㵽����
        add: function(lowerData, upperData, method, alpha, dx, dy, isFast, channel){
            return this.lib.addLayer.add(lowerData, upperData, method, alpha, dx, dy, isFast, channel);
        },

        //��ͼ�������ģ���ӱ任
        applyMatrix: function(imgData, matrixArr){
        }
    };

    //�����ⲿ�ӿ�
    window[Ps] = function(img, width, height){

        if(this instanceof window[Ps]){
            //��¼ʱ�� time trace
            this.startTime = + new Date();

            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            
            //var l = psLib(20,30);��������
            if(!isNaN(img)){

                canvas.width = img;
                canvas.height = width;
                height = height || "#fff";
                context.fillStyle = height;
                context.fillRect(0, 0, img, width);

            }else{
                canvas.width = parseInt(img.width);
                canvas.height = parseInt(img.height);

                var computedStyle = getComputedStyle(img);
                imgWidth = parseInt(computedStyle.getPropertyValue("width"));
                imgHeight = parseInt(computedStyle.getPropertyValue("height"));

                if(!isNaN(imgWidth)) context.drawImage(img, 0, 0, imgWidth, imgHeight);
                else context.drawImage(img, 0, 0);

            }

            //�����õ�canvas����ҽӵ�������
            this.canvas = canvas;
            this.context = context;
            this.imgData = context.getImageData(0, 0, canvas.width, canvas.height);

            //�������ΨһID
            this.name = Ps + "_" + Math.random();
            this.canvas.id = this.name;

            //��¼�ҽӵ�ͼ���ϵĶ��������
            this.layers = [];

            //ԭ��canvas֧��ʱ����ʱcanvas
            var ctxCanvas = document.createElement("canvas");
            ctxCanvas.width = canvas.width;
            ctxCanvas.height = canvas.height;

            this.ctxCanvas = ctxCanvas;
            this.ctxContext = canvas.getContext("2d");

            //Ĭ��ʹ��worker���д���
            this.useWorker = 1;

            //��ʼ��readyStateΪready,readyState�����������
            this.readyState = 1;

            if(this.useWorker){
                //���ʹ��worker,���ʼ��һ��dorsyWorker��װʵ������
                this.dorsyWorker = P.lib.dorsyWorker(this);
            }
            
        }else{

            //�������������
            return new window[Ps](img, width, height);
        }
    };

    //ģ��ע�᷽��
    window[Ps].module = function(name, func){
        P.module(name, func);
    };

    //����һ���ⲿ��������ѧ����ģʽ��ȥ
    window[Ps].dorsyMath = function(){
        return P.lib.dorsyMath;
    };

    //worker����
    onmessage = function(data){
        P.reflect(data[1], data[2], data[3]);
        postMessge("OK");
    };

    //ԭ�Ͷ���
    window[Ps].prototype = {

        //����
        act: function(method, arg){
            console.log("actStart");
            var args = [];

            //��ȡ����Ϊ����
            args = Array.prototype.slice.call(arguments, 1);

            if(this.useWorker){
                this.dorsyWorker.queue.push(["act", method, args]);


                //���readyStateΪ����״̬ ����actΪ�׶��״ζ���,����worker
                if(this.readyState){
                    this.readyState = 0;
                    this.dorsyWorker.startWorker();
                }
            }else{
                //��һ��ת��ӳ��
                P.reflect(method, this.imgData, args);
            }
            
            return this;
        },

        //Ԥ��ģʽ �����е��ٲ���ȫ������ԭ�㣬����ı䱾ͼ���Ч����ֱ��act��ȥ���ⲿ��ͼ��
        view: function(method, arg1, arg2, arg3, arg4){

            //��¡��ͼ�����
            var newLayer = this.clone();

            //��Ǳ�ͼ�������ΪԤ�����Ѻϲ���ͼ��
            newLayer.type = 1;

            //�ҽӿ�¡ͼ�㸱��������
            this.addLayer(newLayer, "����", 0, 0);
            newLayer.act(method, arg1, arg2, arg3, arg4);

            return this;
        },

        //��view�Ľ��ִ�е�ͼ��
        excute: function(){
            var layers = this.layers;
            var n = layers.length;
            if(layers[n - 1] && layers[n - 1][0].type == 1){
                this.imgData = layers[n - 1][0].imgData;
                delete layers[n - 1];
            }
        },

        //ȡ��view�Ľ��ִ��
        cancel: function(){
            var layers = this.layers;
            var n = layers.length;
            if(layers[n - 1] && layers[n - 1][0].type == 1){
                delete layers[n - 1];
            }
        },

        //��ʾ���� isFast���ڿ�����ʾ
        show: function(selector, isFast, flag){
            
            if(flag){
            }else{
                if(this.useWorker){
                    this.dorsyWorker.queue.push(["show", selector, isFast]);
                    return this;
                }
            }

            /*
            //����һ����ʱ��psLib���󣬷�ֹ��Ϊ�ϲ���ʾ�Ա���imgDataӰ��
            var tempPsLib = new window[Ps](this.canvas.width, this.canvas.height);
            tempPsLib.add(this, "����", 0, 0, isFast);
            this.tempPsLib = tempPsLib;

            //���ҽӵ��������ϵ�ͼ����� һ��ϲ�����ʱ��psLib������ȥ ������ʾ�ϲ��Ľ��������Ӱ��ÿ��ͼ�㣬������ͼ��
            for(var i = 0; i < this.layers.length; i ++){
                var tA = this.layers[i];
                var layers = tA[0].layers;
                var currLayer = tA[0];

                if(layers[layers.length - 1] && layers[layers.length - 1][0].type == 1) currLayer = layers[layers.length - 1][0];
                tempPsLib.add(currLayer, tA[1], tA[2], tA[3], isFast);
            }

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //����ʱ����data��ʾ
            */
            this.context.putImageData(this.imgData, 0, 0);

            if(selector){
                document.querySelector(selector).appendChild(this.canvas);
            }else{
                document.body.appendChild(this.canvas);
            }

            return this;
        },

        //�滻ԭ����ͼƬ
        replace: function(img){
            if(img){
                img.onload = function(){};
                img.src = this.save();
            }

            return this;
        },

        //�ϲ�һ��AlloyImageͼ����ȥ
        add: function(){
            
            var numberArr = [], psLibObj, method, alpha, dx, dy, isFast, channel;

            //������
            for(var i = 0; i < arguments.length; i ++){
                if(!i) continue;

                switch(typeof(arguments[i])){
                    case "string":
                        if(/\d+%/.test(arguments[i])){//alpha
                            alpha = arguments[i].replace("%", "");
                        }else if(/[RGB]+/.test(arguments[i])){//channel
                            channel = arguments[i];
                        }else{//method
                            method = arguments[i];
                        }
                    break;

                    case "number":
                        numberArr.push(arguments[i]);
                    break;

                    case "boolean":
                       isFast = arguments[i];
                    break;
                }
            }

            //��ֵ
            dx = numberArr[0] || 0;
            dy = numberArr[1] || 0;
            method = method || "����";
            alpha = alpha / 100 || 1;
            isFast = isFast || false;
            channel = channel || "RGB";

            psLibObj = arguments[0];

            //��ӳ��ת��
            this.imgData = P.add(this.imgData, psLibObj.imgData, method, alpha, dx, dy, isFast, channel);

            return this;
        },

        //����һ��ͼ����ȥ������Ӱ�챾��ֻ����ʾ�б仯
        addLayer: function(psLibObj, method, dx, dy){
            this.layers.push([psLibObj, method, dx, dy]);

            return this;
        },

        clone: function(){

            var tempPsLib = new window[Ps](this.canvas.width, this.canvas.height);
            tempPsLib.context.putImageData(this.imgData, 0, 0);
            tempPsLib.imgData = tempPsLib.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            /*
            tempPsLib.add(this);
            */

            return tempPsLib;
        },

        //����a,bͼ���˳��,ab����ǰ���
        swap: function(a, b){
            var temp = this.layers[a];
            this.layers[a] = this.layers[b];
            this.layers[b] = temp;

            return this;
        },

        //ɾ������ͼ�����
        deleteLayers: function(arr){
            this.layers = this.layers.del(arr);
        },

        //����һ���ϳɺ��ͼ�� png base64
        save: function(isFast){
            if(! this.layers.length){
                this.context.putImageData(this.imgData, 0, 0);
                return this.canvas.toDataURL(); 
            }


            //����һ����ʱ��psLib���󣬷�ֹ��Ϊ�ϲ���ʾ�Ա���imgDataӰ��
            var tempPsLib = new window[Ps](this.canvas.width, this.canvas.height);
            tempPsLib.add(this, "����", 0, 0, isFast);
            this.tempPsLib = tempPsLib;

            //���ҽӵ��������ϵ�ͼ����� һ��ϲ�����ʱ��psLib������ȥ ������ʾ�ϲ��Ľ��������Ӱ��ÿ��ͼ�㣬������ͼ��
            for(var i = 0; i < this.layers.length; i ++){
                var tA = this.layers[i];
                var layers = tA[0].layers;
                var currLayer = tA[0];

                if(layers[layers.length - 1] && layers[layers.length - 1][0].type == 1) currLayer = layers[layers.length - 1][0];

                tempPsLib.add(currLayer, tA[1], tA[2], tA[3], isFast);
            }

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            //����ʱ����data��ʾ
            this.context.putImageData(tempPsLib.imgData, 0, 0);

            return this.canvas.toDataURL(); 
        },

        //����ֱ��ͼ
        drawRect: function(selector){
            var canvas;

            if(canvas = document.getElementById("imgRect")){
            }else{
                canvas = document.createElement("canvas");
                canvas.id = "imgRect";
                document.body.appendChild(canvas);
                canvas.width = parseInt(this.canvas.width);
                canvas.height = parseInt(this.canvas.height);
            }

            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);

            var result = [];
            var data = this.tempPsLib.imgData.data;

            for(var i = 0, n = data.length; i < n; i ++){
               if(!result[data[i]]){
                    result[data[i]] = 1;
               }else{
                    result[data[i]] ++;
               }
            }

            context.beginPath();
            context.moveTo(0, canvas.height);

            var max = 0;

            for(var i = 0; i < 255; i ++){
                if(result[i] > max) max = result[i];
            }

            for(var i = 0; i < 255; i ++){
                var currY = result[i] || 0;
                currY = canvas.height - currY / max * 0.8 * canvas.height;
                context.lineTo(i / 256 * canvas.width, currY, 1, 1); 
            }
            
            context.lineTo(canvas.width + 10, canvas.height);
            context.fill();
        },

        //���Ч��
        ps: function(effect){
            var fun = P.reflectEasy(effect);
            var _this = this;

            _this = fun.call(_this);

            this.logTime("���Ч��" + effect);

            return _this;
        },

        //��¼����ʱ��
        logTime: function(msg){
            console.log(msg + ": " + (+ new Date() - this.startTime) / 1000 + "s");
        },

        //����ԭ��canvas.context�ӿ�
        ctx: function(func){
            //func�е�thisָ��context
            var ctx = this.ctxContext;

            ctx.putImageData(this.imgData, 0, 0);

            //����func
            func.call(ctx);
            this.imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

            return this;
        },

        notify: function(msg){
            //֪ͨ
            if(msg == "readyStateOK") this.readyState = 1;
        }
    };

})("psLib");

window.AlloyImage = $AI = window.psLib;
/*
 * @author: Bin Wang
 * @description:�Ҷ���չ
 *
 * */
;(function(Ps){

    window[Ps].module("ImageEnhance",function(P){

        var M = {
            process: function(imgData,arg1,arg2){
                var lamta = arg || 0.5;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var p1 = arg1 || {x: 10,y: 10};
                var p2 = arg2 || {x: 50,y: 40};

                function transfer(d){
                }

                for(var i = 0,n = data.length;i < n;i += 4){
                    
                }

                imgData.data = data;

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: Main add
 *
 * */
;(function(Ps){

    window[Ps].module("addLayer",function(P){

        var Add = {

            //isFast���ڿ��٣��������м䴦��
            add: function(lowerData, upperData, method, alpha, dx, dy, isFast, channel){
                var l = lowerData.data,
                    u = upperData.data,
                
                    dx = dx || 0,
                    dy = dy || 0,
                    alpha = alpha || 1,//alpha ��ΧΪ0 - 100
                    isFast = isFast || false,
                    channel = channel || "RGB";

                if(!(/[RGB]+/.test(channel))){
                    channel = "RGB";
                }
                
                var channelString = channel.replace("R","0").replace("G","1").replace("B","2"),
                    jump = 1,
                    result,
                    width = lowerData.width,
                    height = lowerData.height,
                    upperLength = u.length,
                    upperWidth = upperData.width,

                    indexOfArr = [
                        channelString.indexOf("0") > -1,
                        channelString.indexOf("1") > -1,
                        channelString.indexOf("2") > -1
                    ],
                    everyJump = 4 * jump;

                     /*
                if(isFast){
                   jump = 1; 
                }
                */           

                var ii, row, col, uRow, uCol, uIi, uI;

                for(var i = 0, n = l.length; i < n; i += everyJump){

                    ii = i / 4;

                    //�õ���ǰ������� y����
                    row = parseInt(ii / width); 
                    col = ii % width;

                    uRow = row - dy;
                    uCol = col - dx;

                    uIi = uRow * upperWidth + uCol;
                    uI = uIi * 4;

                    if(uI >= 0 && uI < (upperLength - 4) && uCol < upperWidth && uCol >= 0){

                        //l[i + 3] = u[uI + 3];//͸����
                        for(var j = 0;j < 3;j ++){

                            //���˵�͸���򲻼���
                            if(u[uI + 3] == 0) break;
                            else l[i + 3] = u[uI + 3];

                            switch(method){
                                case "��ɫ����" :
                                    if(indexOfArr[j]){
                                       result = l[i + j] + (l[i + j] * u[uI + j]) / (255 - u[uI + j]);
                                       l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "�䰵":
                                    if(indexOfArr[j]){
                                        result = l[i + j] < u[uI + j] ? l[i + j] : u[uI + j];
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "����":
                                    if(indexOfArr[j]){
                                        result = l[i + j] > u[uI + j] ? l[i + j] : u[uI + j];
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "��Ƭ����":
                                    if(indexOfArr[j]){
                                        result = parseInt((l[i + j] * u[uI + j]) / 255);
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "��ɫ" :
                                    if(indexOfArr[j]){
                                        result = parseInt(255 - (255 - l[i + j]) * (255 - u[uI + j]) / 255);
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "����":
                                    if(indexOfArr[j]){
                                        if(l[i + j] <= 127.5){
                                            result = l[i + j] * u[uI + j] / 127.5;
                                        }else{
                                            result = 255 - (255 - l[i + j]) * (255 - u[uI + j]) / 127.5;
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "ǿ��":
                                    if(indexOfArr[j]){
                                        if(u[uI + j] <= 127.5){
                                            result = l[i + j] * u[uI + j] / 127.5;
                                        }else{
                                            result = l[i + j] + (255 - l[i + j]) * (u[uI + j] - 127.5) / 127.5;
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "��ֵ":
                                    if(indexOfArr[j]){
                                        result = l[i + j] > u[uI + j] ? l[i + j] - u[uI + j] : u[uI + j] - l[i + j];
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "�ų�":
                                    if(indexOfArr[j]){
                                        result = l[i + j] + u[uI + j] - (l[i + j] * u[uI + j]) / 127.5;
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "���":
                                    if(indexOfArr[j]){
                                        if(l[i + j] < (2 * u[uI + j] - 255)){
                                            result = 2 * u[uI + j] - 255;
                                        }else if(l[i + j] < 2 * u[uI + j]){
                                            result = l[i + j];
                                        }else{
                                            result = 2 * u[uI + j];    
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "��ɫ����":
                                    if(indexOfArr[j]){
                                        result = 255 - 255 * (255 - l[i + j]) / u[uI + j];
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "���Լ���":
                                    if(indexOfArr[j]){
                                        var tempR = l[i + j] + u[uI + j];
                                        result = tempR > 255 ? tempR - 255 : 0;
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "���Լ���":
                                    if(indexOfArr[j]){
                                        var tempR = l[i + j] + u[uI + j];
                                        result = tempR > 255 ? 255 : tempR;
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "���":
                                    if(indexOfArr[j]){
                                        if(u[uI + j] < 127.5){
                                            result = ((2 * u[uI + j] - 255) * (255 - l[i + j]) / (255 * 255) + 1) * l[i + j];
                                        }else{
                                            result = (2 * u[uI + j] - 255) * (Math.sqrt(l[i + j] / 255) - l[i + j] / 255) + l[i + j];
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "����":
                                    if(indexOfArr[j]){
                                        if(u[uI + j] < 127.5){
                                            result = (1 - (255 - l[i + j]) / (2 * u[uI + j])) * 255;
                                        }else{
                                            result = l[i + j] / (2 * (1 - u[uI + j] / 255));
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "���Թ�":
                                    if(indexOfArr[j]){
                                        var tempR = l[i + j] + 2 * u[uI + j] - 255;
                                        result = tempR > 255 ? 255 : tempR;
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                case "ʵɫ���":
                                    if(indexOfArr[j]){
                                        if(u[uI + j] < (255 - l[i + j])){
                                            result = 0;
                                        }else{
                                            result = 255;
                                        }
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                                    break;

                                default: 
                                    if(indexOfArr[j]){
                                        result = u[uI + j];
                                        l[i + j] = (1 - alpha) * l[i + j] + (alpha) * result;
                                    }
                            }
                        }
                    }
                    
                }

                return lowerData;
            }
        };

        return Add;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: �������ȶԱȶ�
 *
 * */
;(function(Ps){

    window[Ps].module("brightness",function(P){

        var M = {
            //�������ȶԱȶ�
            process: function(imgData, args){
                var data = imgData.data;
                var brightness = args[0] / 50;// -1,1
                var arg2 = args[1] || 0;
                var c = arg2 / 50;// -1,1
                var k = Math.tan((45 + 44 * c) * Math.PI / 180);

                for(var i = 0,n = data.length;i < n;i += 4){
                    for(var j = 0;j < 3;j ++){
                        data[i + j] = (data[i + j] - 127.5 * (1 - brightness)) * k + 127.5 * (1 + brightness);
                    }
                }

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: ���ұ�Ե
 *
 * */
;(function(Ps){

    window[Ps].module("applyMatrix",function(P){

        var M = {
            process: function(imgData, arg){
                var lamta = arg || 0.6;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var template = new P.lib.dorsyMath.Matrix([
                        -2,-4,-4,-4,-2,
                        -4,0,8,0,-4,
                        -4,8,24,8,-4,
                        -4,0,8,0,-4,
                        -2,-4,-4,-4,-2
                    ],25,1);                    
                var tempData = [];

                for(var i = 0, n = data.length; i < n; i += 4){
                    var ii = i / 4;
                    var row = parseInt(ii / width);
                    var col = ii % width;
                    if(row == 0 || col == 0) continue;

                    var pixelArr = [[],[],[]];

                    for(var k = -2; k < 3; k ++){
                        var currRow = row + k;

                        for(var kk = -2; kk < 3; kk ++){

                            var currCol = col + kk;
                            var currI = (currRow * width + currCol) * 4;

                            for(var j = 0; j < 3; j ++){
                                var tempI = currI + j; 
                                pixelArr[j].push(data[tempI]);
                            }

                        }

                    }

                    var pixelMatrix = new P.lib.dorsyMath.Matrix(pixelArr, 3, matrixSize);
                    var resultMatrix = pixelMatrix.mutiply(template);

                    for(var j = 0; j < 3; j ++){
                       tempData[i + j] = resultMatrix.data[j]; 
                    }

                    tempData[i + 4] = data[i + 4];
                }

                for(var i = 0, n = data.length; i < n; i ++){
                    data[i] = tempData[i] || data[i];
                }

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: Main config
 *
 * */
;(function(Ps){

    window[Ps].module("config",function(P){

        //��¼ӳ���ϵ
        var Reflection = {
            "�Ҷȴ���": "toGray",
            "��ɫ": "toReverse",
            "�Ҷ���ֵ": "toThresh",
            "��˹ģ��": "gaussBlur",
            "����": "brightness",
            "����Ч��": "embossment",
            "���ұ�Ե": "borderline",
            "ɫ��/���Ͷȵ���": "setHSI",
            "������": "mosaic",
            "�ͻ�": "oilPainting",
            "��ʴ": "corrode",
            "��" : "sharp",
            "�����ɫ" : "noise",
            "����" : "curve",
            "����" : "darkCorner",
            "���" : "dotted"
        };

        var EasyReflection = {
            "����" : "softenFace",
            "����" : "sketch",
            "��Ȼ��ǿ" : "softEnhancement",
            "�ϵ�" : "purpleStyle",
            "�ό" : "soften",
            "����" : "vintage",
            "�ڰ�" : "gray",
            "��lomo" : "lomo",
            "������ǿ" : "strongEnhancement",
            "�Ұ�" : "strongGray",
            "��ɫ" : "lightGray",
            "ů��" : "warmAutumn",
            "ľ��" : "carveStyle",
            "�ֲ�" : "rough"
        };

        var Config = {

            getModuleName: function(method){
                return Reflection[method] || method;
            },

            getEasyFun: function(effect){
                return EasyReflection[effect] || effect;
            }
        };

        return Config;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:    ��ʴ 
 *
 * */
;(function(Ps){

    window[Ps].module("corrode", function(P){

        var M = {
            process: function(imgData, arg){
                var R = parseInt(arg[0]) || 3;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                //����
                for(var x = 0; x < width; x ++){

                    for(var y = 0; y < height; y ++){
                        
                        var randomI = parseInt(Math.random() * R * 2) - R ;//�����������
                        var randomJ = parseInt(Math.random() * R * 2) - R;//�����������
                        var realI = y * width + x;
                        var realJ = (y + randomI) * width + x + randomJ;

                        for(var j = 0; j < 3; j ++){
                            data[realI * 4 + j] = data[realJ * 4 + j];
                        }

                    }

                }

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:    ���� 
 *
 * */
;(function(Ps){

    window[Ps].module("curve", function(P){

        var M = {
            process: function(imgData, arg){
                /*
                 * arg   arg[0] = [3,3] ,arg[1]  = [2,2]
                 * */

                //��ò�ֵ����
                var f = P.lib.dorsyMath.lagrange(arg[0], arg[1]);
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;

                //����
                for(var x = 0; x < width; x ++){

                    for(var y = 0; y < height; y ++){
                        
                        var realI = y * width + x;

                        for(var j = 0; j < 3; j ++){
                            data[realI * 4 + j] = f(data[realI * 4 + j]);
                        }

                    }

                }

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:     ����
 *
 * */
;(function(Ps){

    window[Ps].module("darkCorner", function(P){

        var M = {
            process: function(imgData,arg){
                //���Ǽ��� ��1-10����
                var R = parseInt(arg[0]) || 3;

                //���ǵ���״
                var type = arg[2] || "round";

                //�������յļ��� 0 - 255
                var lastLevel = arg[1] || 30;

                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                //�������ĵ�
                var middleX = width * 2 / 3;
                var middleY = height * 1/ 2;
                
                //��������ĵ������
                var maxDistance = P.lib.dorsyMath.distance([middleX ,middleY]);
                //��ʼ�������ǵľ���
                var startDistance = maxDistance * (1 - R / 10);

                var f = function(x, p0, p1, p2, p3){

                 //�������α��������� 
                     return p0 * Math.pow((1 - x), 3) + 3 * p1 * x * Math.pow((1 - x), 2) + 3 * p2 * x * x * (1 - x) + p3 * Math.pow(x, 3);
               }

                //���㵱ǰ��Ӧ���ӵİ���
                function calDark(x, y, p){
                    //��������ĵ����
                    var distance = P.lib.dorsyMath.distance([x, y], [middleX, middleY]);
                    var currBilv = (distance - startDistance) / (maxDistance - startDistance);
                    if(currBilv < 0) currBilv = 0;

                    //Ӧ�����Ӱ���
                    return  f(currBilv, 0, 0.02, 0.3, 1) * p * lastLevel / 255;
                }

                //����
                for(var x = 0; x < width; x ++){

                    for(var y = 0; y < height; y ++){
                        
                        var realI = y * width + x;
                        for(var j = 0;j < 3;j ++){
                            var dDarkness = calDark(x, y, data[realI * 4 + j]);
                            data[realI * 4 + j] -= dDarkness;
                        }

                    }

                }


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:��ѧ����ģ��-core 
 * FFT ���� ���� Langrange��ֵ
 *
 * */
;(function(Ps){

    window[Ps].module("dorsyMath", function(P){
        
        var M = {
            FFT1: function(dataArr){
            /*
             * @description:���ٸ���Ҷ�任
             * @��ʱ���ȡ
             * */
                var size = dataArr.length;
                var count = 0;

                //------����Ȩ��W------------
                var W = [];
                for(var i = 0; i < size; i ++){
                    W[i] = this.exp(-2 * Math.PI * i / size);
                }
                

                butterflyCal();
                return dataArr;

                //�������㵥Ԫ
                function butterflyCal(){
                    count ++;

                    //���ε�Ԫ����
                    var singleLength = size / Math.pow(2,count);
                    var everyLength = size / singleLength;

                    for(var i = 0; i < singleLength; i ++){

                        //��μ�����ε�Ԫ
                        singleButterflyCal(i * everyLength, (i + 1) * everyLength - 1, count);
                    }

                    //�����Ԫ��������1��������
                    if(singleLength > 1){

                        //�ݹ�
                        butterflyCal();
                    }else{
                    }
                    
                }

                //һ�����ε�Ԫ n������� ���ε�Ԫ�ĳɶԼ��
                function singleButterflyCal(start, end, n){

                    var delta =  Math.pow(2,n - 1);

                    for(var i = start, j = 0; i <= (end - delta); i ++){

                        //i �������
                        var pairI = i + delta;

                        //����i����ʱ��Ȩ���±�
                        var currWeightForI = j * size / Math.pow(2,n);

                        //����i�������ʱ���Ȩ��
                        var currWeightForPairI = currWeightForI + size / 4;

                        if(!(dataArr[i] instanceof M.C)) dataArr[i] = new M.C(dataArr[i]);

                        if(!(dataArr[pairI] instanceof M.C)) dataArr[pairI] = new M.C(dataArr[pairI]);

                        var currResultForI = dataArr[i].plus(dataArr[pairI].mutiply(W[currWeightForI]));
                        var currResultForPairI = dataArr[i].plus(dataArr[pairI].mutiply(W[currWeightForPairI]));

                        dataArr[i] = currResultForI;
                        dataArr[pairI] = currResultForPairI;

                        j++;
                    }
                }

            },

            DFT: function(){
            /*
             * @description:��ɢ����Ҷ�任
             * */

            },

            Matrix: function(arr,arg,arg2){
            /*
             * @descriptiont:������
             * ����һ������,��Ȼ��ԭʼ�����ݹ���,�����о�������л������㷽��
             * arr��������Ϊ����,�����ַ�������Ϊ����������� ([0,0],"3*4")    ��("����3*4��1����")  ("����3*4��0����")
             * */
                var resultArr = [];

                if(arg){

                    if(isNaN(arg)){
                        var m = /(\d+)\*/.exec(arg)[1];
                        var n = /\*(\d+)/.exec(arg)[1];
                    }else{
                        m = arg;
                        n = arg2;
                    }

                    //�����ά��
                    if(arr[0] && arr[0][0]){
                        for(var i = 0;i < m;i ++){
                            resultArr[i] = [];
                            for(var j = 0;j < n;j ++){
                                resultArr[i][j] = arr[i][j] || 0;
                            }
                        }

                    //һά��
                    }else{

                        for(var i = 0;i < m;i ++){
                            resultArr[i] = [];
                            for(var j = 0;j < n;j ++){
                                var t = i * n + j;
                                resultArr[i][j] = arr[i * n + j] || 0;
                            }
                        }

                    }

                    this.m = m;
                    this.n = n;

                }else{
                    this.m = arr.length;
                    this.n = arr[0].length;
                }

                this.data = resultArr;
            },

            C: function(r,i){
            /*
             * @description:��������
             *
             * */
               this.r = r || 0;//ʵ��
               this.i = i || 0;//�鲿
            },

            exp: function(theta,r){//  r e^(i * theta) = r cos theta + r i * sin theta

                theta = theta || 0;
                r = r || 1;

                var tempC = new M.C();
                tempC.r = r * Math.cos(theta);
                tempC.i = r * Math.sin(theta);
                
                return tempC;
            },

            lagrange: function(xArr,yArr){
            /*
             * Lagrange��ֵ
             * @usage   M.lagrange([1,2],[2,4])(3);
             * */
                var num = xArr.length;
                function getLk(x,k){//����lk
                    var omigaXk = 1;
                    var omigaX = 1;
                    for(var i = 0;i < num;i ++){
                        if(i != k){
                            omigaXk *= xArr[k] - xArr[i];
                            omigaX *= x - xArr[i];
                        }
                    }
                    var lk = omigaX / omigaXk;
                    return lk;
                }
                var getY = function(x){
                    var L = 0;
                    for(var k = 0;k < num;k ++){
                        var lk = getLk(x,k);
                        L += yArr[k] * lk;

                    }
                    return L;
                };
                return getY;

            },

            applyMatrix: function(imgData,matrixArr,low){//��ͼ���ź�ʵ����ģ���ӱ任 lowΪ��ֵ,�˲�����

                low = low || 0;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var matrixSize = matrixArr.length;
                var template = new M.Matrix(matrixArr,matrixSize,1);                    
                var tempData = [];
                var start = -(Math.sqrt(matrixSize) - 1) / 2;

                for(var i = 0,n = data.length;i < n;i += 4){
                    var ii = i / 4;
                    var row = parseInt(ii / width);
                    var col = ii % width;
                    if(row == 0 || col == 0) continue;

                    var pixelArr = [[],[],[]];
                    for(var k = start;k <= -start;k ++){
                        var currRow = row + k;

                        for(var kk = start;kk <= -start;kk ++){

                            var currCol = col + kk;
                            var currI = (currRow * width + currCol) * 4;

                            for(var j = 0;j < 3;j ++){
                                var tempI = currI + j; 
                                pixelArr[j].push(data[tempI]);
                            }

                        }

                    }

                    var pixelMatrix = new P.lib.dorsyMath.Matrix(pixelArr,3,matrixSize);
                    var resultMatrix = pixelMatrix.mutiply(template);

                    for(var j = 0;j < 3;j ++){
                       tempData[i + j] = resultMatrix.data[j]; 
                    }
                    tempData[i + 4] = data[i + 4];
                }

                for(var i = 0,n = data.length;i < n;i ++){
                    if(tempData[i]){
                        data[i] = tempData[i] < low ? tempData[i] : data[i];
                    }
                }

                return imgData;
            },

            RGBToHSI: function(R,G,B){
                var theta = ((R - G + R - B) / 2) / Math.sqrt((R - G) * (R - G) + (R - B) * (G - B)) || 0;
                theta = Math.acos(theta);
                var H = B > G ? (2 * Math.PI - theta) : theta;
                var S = 1 - 3 * Math.min(R,G,B) / (R + G + B);
                var I = (R + G + B) / 3;

                if(H > 2 * Math.PI) H = 2 * Math.PI;
                if(H < 0) H = 0;

                return {
                    H: H,
                    S: S,
                    I: I
                };

            },

            HSIToRGB: function(H,S,I){//HΪ����ֵ
                //H (-Math.PI , Math.PI)  S (-1,1) I (-255,255)
                if(H < 0){
                    H %= 2 * Math.PI;
                    H += 2 * Math.PI
                }else{
                    H %= 2 * Math.PI;
                }

                if(H <= Math.PI * 2 / 3){
                    var B = I * (1 - S);
                    var R = I * (1 + S * Math.cos(H) / Math.cos(Math.PI / 3 - H));
                    var G = 3 * I - (R + B);

                }else if(H <= Math.PI * 4 / 3){
                    H = H - Math.PI * 2 / 3;

                    var R = I * (1 - S);
                    var G = I * (1 + S * Math.cos(H) / Math.cos(Math.PI / 3 - H));
                    var B = 3 * I - (G + R);

                }else{
                    H = H - Math.PI * 4 / 3;

                    var G = I * (1 - S);
                    var B = I * (1 + S * Math.cos(H) / Math.cos(Math.PI / 3 - H));
                    var R = 3 * I - (G + B);

                }

                return {
                    R: R,
                    G: G,
                    B: B
                };
            },

            applyInHSI: function(imgData,func){//��hsi�ռ���Ӧ��func
                /*
                 * function(i){
                 *      i.H += 3;
                 * }
                 * H (-2*Math.PI , 2 * Math.PI)  S (-1,1) I (-255,255)
                 * */
                var data = imgData.data;
                for(var i = 0,n = data.length;i < n;i += 4){
                    var hsiObj = this.RGBToHSI(data[i],data[i + 1],data[i + 2]);
                    func(hsiObj);
                    if(hsiObj.S > 1) hsiObj.S = 1;
                    if(hsiObj.S < 0) hsiObj.S = 0;

                    var rgbObj = this.HSIToRGB(hsiObj.H,hsiObj.S,hsiObj.I);
                    data[i] = rgbObj.R;
                    data[i + 1] = rgbObj.G;
                    data[i + 2] = rgbObj.B;
                }
                
            },

            applyInCoordinate: function(imgData,func){//������ռ���Ӧ��func
                /*
                 * function(dot){
                 *      
                 * }
                 * */
            },

            //����������֮��ľ���
            //p1   array
            //p2   array
            distance: function(p1, p2){
                p2 = p2 || [0, 0];

                p1 = new M.C(p1[0], p1[1]);
                p2 = new M.C(p2[0], p2[1]);

                var p3 = p1.minus(p2);
                return p3.distance();
            },

            //��(x,y)������תΪ��ά��i
            xyToIFun: function(width){
                return function(x, y, z){
                    z = z || 0;
                    return (y * width + x) * 4 + z;
                };
            },

            //��(x,y)��������
            //rgbfun ��rgb�����Ͻ��еĲ��� aFun��alpha���еĲ���
            xyCal: function(imgData, x, y, rgbFun, aFun){
                var xyToIFun  = this.xyToIFun(imgData.width);
                for(var i = 0; i < 3; i ++){
                    var j  = xyToIFun(x, y, i);
                    imgData[j] = rgbFun(imgData[j]);
                }

                if(aFun){
                    imgData[j + 1] = aFun(imgData[j + 1]);
                }

            }
            
        };

        /*
        var t = M.RGBToHSI(255,5,25);
        var f = M.HSIToRGB(t.H+2 * Math.PI,t.S,t.I);
        alert(f.R + "|" + f.G + "|" + f.B);
        */

        M.Matrix.prototype = {
            /*m: 0,//��ѧ�ϴ�ͳ��m*n����
            n: 0,
*/
            plus: function(matrix){
                if(this.m != matrix.m || this.n != matrix.n){
                    throw new Error("����ӷ����в�ƥ��");
                }


                var tempM = new M.Matrix([],this.m,this.n);
                for(var i = 0;i < this.m;i ++){
                   for(var j = 0;j < this.n;j ++){
                        tempM.data[i][j] = this.data[i][j] + matrix.data[i][j];
                   }
                }
                return tempM;
            },

            minus: function(matrix){
                if(this.m != matrix.m || this.n != matrix.n){
                    throw new Error("������������в�ƥ��");
                }


                var tempM = new M.Matrix([],this.m,this.n);
                for(var i = 0;i < this.m;i ++){
                   for(var j = 0;j < this.n;j ++){
                        tempM.data[i][j] = this.data[i][j] - matrix.data[i][j];
                   }
                }
                return tempM;
            },

            mutiply: function(matrix){//�����һ����
                if(this.n != matrix.m){
                    throw new Error("����˷����в�ƥ��");
                }


                var tempM = new M.Matrix([],this.m,matrix.n);
                for(var i = 0;i < this.m;i ++){
                   for(var j = 0;j < matrix.n;j ++){

                        var sum = 0;
                        for(var ii = 0;ii < this.n;ii ++){
                            sum += this.data[i][ii] * matrix.data[ii][j];
                        }
                        tempM.data[i][j] = sum;
                   }
                }
                return tempM;

            }
        };

        M.C.prototype = {
            plus: function(c){
                var tempC = new M.C();
                tempC.r = this.r + c.r;
                tempC.i = this.i + c.i;

                return tempC;
            },
            minus:function(c){
                var tempC = new M.C();
                tempC.r = this.r - c.r;
                tempC.i = this.i - c.i;

                return tempC;
            },
            mutiply: function(c){
                var tempC = new M.C();
                tempC.r = this.r * c.r - this.i * c.i;
                tempC.i = this.r * c.i + this.i * c.r;

                return tempC;
            },
            divide: function(c){

                var tempC = new M.C();

                var m = c.mutiply(c.conjugated());
                var f = this.mutiply(c.conjugated());
                tempC.r = f.r / m.r;
                tempC.i = f.i / m.r;

                return tempC;
            },
            conjugated: function(){//ȡ����
                var tempC = new M.C(this.r,-this.i);
                return tempC;
            },

            //ȡģ
            distance: function(){
                return Math.sqrt(this.r * this.r + this.i * this.i);
            }
        }
/*
    var l = new M.Matrix([1,1,2,3],2,2);
    var j = new M.Matrix([1,0,1,2],2,2);
    var t = l.mutiply(j);
    */
        return M;

    });

})("psLib");
/* * @author: Bin Wang
 * @description: Main worker
 *
 * */
;(function(Ps){

    window[Ps].module("dorsyWorker",function(P){
        //�ȴ�ʱ��
        var WAITING_SECONDS = 800;

        var M = function(aiObj){
            //static private single
            var worker = new Worker("js/combined/workerTest.js?" + (new Date()));

            var workerObj = {
                //�ȴ�����Ķ���
                queue: [],
                //��ʼ������߳�
                startWorker: function(){
                    console.log("startWorker");
                    this.shiftAction();
                },

                //�Ӷ�����ȡ��һ������������
                shiftAction: function(){
                    var action = this.queue.shift(), _this = this;

                    //���û����,�ȴ�100ms�ٴμ��, �����û��,����������������������, readyOK
                    if(! action){
                        setTimeout(function(){
                            action = _this.queue.shift();

                            if(! action){
                                aiObj.notify("readyStateOK");
                            }

                        }, WAITING_SECONDS);
                    }

                    //�˴���Ϊ����
                    if(action[0] == "act"){
                        console.log("postStart");

                        //��worker����Ϣ
                        worker.postMessage([action[1], aiObj.imgData, action[2]]);

                    //Ϊ���Ҫ�����ӵ�ͼ���Ƿ������
                    }else if(action[0] == "add"){
                        function checkReadyState(){
                            //���
                            if(action[1].readyState){

                            //���û������򲻶ϼ���Ƿ����,�ڼ�����������Ķ���,��������ʱ��ֹ
                            }else{
                                setTimeout(function(){
                                    checkReadyState();
                                }, WAITING_SECONDS);
                            }
                        }
                    }else if(action[0] == "show"){
                        aiObj.show(action[1], action[2], 1);
                    }
                },

                //worker�ص�����
                callback: function(data){
                    console.log("callback");
                    aiObj.imgData = data;
                    this.shiftAction();
                }
            };

            //�յ���Ϣ���ٴӶ����м��Ȼ����д���
            worker.onmessage = function(e){
                console.log("onmessage");
                workerObj.callback(e.data);
            };

            return workerObj;
        };

        return M;

    });

})("psLib");

/*
 * @author: Bin Wang
 * @description:  ������ 
 *
 * */
;(function(Ps){

    window[Ps].module("dotted",function(P){

        var M = {
            process: function(imgData,arg){//�������ȶԱȶ�
                //���ΰ뾶
                var R = parseInt(arg[0]) || 1;

                //��СԲ�뾶
                var r = parseInt(arg[1]) || 1;

                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                //�������ģ��
                var disTmlMatrix = [
                ];

                var r2 = r * r;
                for(var x = -R; x < R; x ++){

                    for(var y = -R; y < R; y ++){
                        if((x * x + y * y) > r2){
                            disTmlMatrix.push([x, y]);
                        }
                    }

                }

                var xyToIFun = P.lib.dorsyMath.xyToIFun(width);

                //�����ھ��������͸������Ϊ0
                for(var x = 0, n = parseInt(width / xLength); x < n; x ++){

                    for(var y = 0, m = parseInt(height / xLength); y < m;y ++){
                        var middleX = parseInt((x + 0.5) * xLength);
                        var middleY = parseInt((y + 0.5) * xLength);

                        for(var i = 0; i < disTmlMatrix.length; i ++){
                            var dotX = middleX + disTmlMatrix[i][0];
                            var dotY = middleY + disTmlMatrix[i][1];

                            //data[(dotY * width + dotX) * 4 + 3] = 0;
                            data[xyToIFun(dotX, dotY, 3)] = 225;
                            data[xyToIFun(dotX, dotY, 2)] = 225;
                            data[xyToIFun(dotX, dotY, 0)] = 225;
                            data[xyToIFun(dotX, dotY, 1)] = 225;
                        }
                    }

                }

                /*
                for(var x = 0; x < width; x ++){
                    for(var y = 0; y < height; y ++){
                        data[(y * width + x) * 4 + 3] = 0;
                    }
                }
                */


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:    ��ʴ 
 *
 * */
;(function(Ps){

    window[Ps].module("easy",function(P){

        var M = {
            getFun: function(fun){
                var Effects = {
                    softenFace: function(){//����
                        var _this = this.clone();
                        return  _this.add(
                            this.act("��˹ģ��",10),"��ɫ"
                        ).act("����",-10,5);
                    },
                    sketch: function(){//����
                        var _this = this.act("�Ҷȴ���").clone();
                        return this.add(
                            _this.act("��ɫ").act("��˹ģ��",8), "��ɫ����"
                        ).act("��",1);
                    },
                    softEnhancement: function(){//��Ȼ��ǿ
                      return this.act("����",[0,190,255],[0,229,255]);
                    },
                    purpleStyle: function(){
                        var _this = this.clone();
                        return this.add(
                            _this.act("��˹ģ��",3), "��Ƭ����" ,"RG"
                        );
                        
                    },
                    soften: function(){
                        var _this = this.clone();
                        return this.add(
                            _this.act("��˹ģ��",6), "�䰵"
                        );
                    },
                    vintage: function(){//����
                        var _this = this.clone();
                        return this.act("�Ҷȴ���").add(
                            window[Ps](this.canvas.width,this.canvas.height,"#808080").act("�����ɫ").act("��˹ģ��",4).act("ɫ��/���Ͷȵ���",32,19,0,true),"����"
                        );
                    },
                    gray: function(){//�ڰ�
                        return this.act("�Ҷȴ���");
                    },
                    lomo: function(){//��lomo
                        var m = this.clone().add(
                            this.clone() , "��ɫ"
                        ).add(
                            this.clone() , "���"
                        );

                        return m.add(
                            this.clone().act("��ɫ") , "����","20%","B"
                        ).act("����", 6, 200);
                        
                    },
                    strongEnhancement: function(){
                        return this.clone().add(
                            this.clone().act("����",[0,50,255],[0,234,255]), "���"
                        );
                    },
                    strongGray: function(){//�߶Ա� �Ұ�
                        return this.act("�Ҷȴ���").act("����",[0,61,69,212,255],[0,111,176,237,255]);
                    },
                    lightGray: function(){
                            return this.act("�Ҷȴ���").act("����",[0,60,142,194,255],[0,194,240,247,255])
                    },
                    warmAutumn: function(){
                        var m = this.clone().act("ɫ��/���Ͷȵ���",36,47,8,true).act("����", 6, 150);
                        return this.add(
                            m, "����"
                        );
                    },

                    //ľ���Ч��
                    carveStyle: function(){
                        var layerClone = this.clone().act("������").act("���ұ�Ե").act("����Ч��");
                        return this.add(
                            layerClone, "���Թ�"
                        );
                    },

                    //�ֲ�
                    rough: function(){
                       return this.add(

                           window[Ps](this.canvas.width, this.canvas.height, "#000").act("���").act("��ɫ").act("����Ч��")
                           ,"����"
                       );
                    }
                };

                return Effects[fun];
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:  ����Ч��
 *
 * */
;(function(Ps){

    window[Ps].module("embossment",function(P){

        var M = {
            process: function(imgData,arg){//�������ȶԱȶ�
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;

                var outData = [];
                for(var i = 0,n = data.length;i < n;i += 4){

                    var ii = i / 4;
                    var row = parseInt(ii / width);
                    var col = ii % width;
                    var A = ((row - 1) *  width + (col - 1)) * 4;
                    var G = (row + 1) * width * 4 + (col + 1) * 4;

                    if(row == 0 || col == 0) continue;
                    for(var j = 0;j < 3;j ++){
                        outData[i + j] = data[A + j] - data[G + j] + 127.5;
                    }
                    outData[i + 4] = data[i + 4];
                }

                for(var i = 0,n = data.length;i < n;i ++){
                    data[i] = outData[i] || data[i];
                }


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: az@alloyTeam Bin Wang
 * @description: ��˹ģ��
 *
 * */
;(function(Ps){

    window[Ps].module("gaussBlur",function(P){

        var M = {

          /**
             * ��˹ģ��
             * @param  {Array} pixes  pix array
             * @param  {Number} width ͼƬ�Ŀ��
             * @param  {Number} height ͼƬ�ĸ߶�
             * @param  {Number} radius ȡ������뾶, ����, ��ѡ, Ĭ��Ϊ 3.0
             * @param  {Number} sigma ��׼����, ��ѡ, Ĭ��ȡֵΪ radius / 3
             * @return {Array}
             */
            process: function(imgData,radius, sigma) {
                var pixes = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var gaussMatrix = [],
                    gaussSum = 0,
                    x, y,
                    r, g, b, a,
                    i, j, k, len;


                radius = Math.floor(radius) || 3;
                sigma = sigma || radius / 3;
                
                a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
                b = -1 / (2 * sigma * sigma);
                //���ɸ�˹����
                for (i = 0, x = -radius; x <= radius; x++, i++){
                    g = a * Math.exp(b * x * x);
                    gaussMatrix[i] = g;
                    gaussSum += g;
                
                }
                //��һ��, ��֤��˹�����ֵ��[0,1]֮��
                for (i = 0, len = gaussMatrix.length; i < len; i++) {
                    gaussMatrix[i] /= gaussSum;
                }
                //x ����һά��˹����
                for (y = 0; y < height; y++) {
                    for (x = 0; x < width; x++) {
                        r = g = b = a = 0;
                        gaussSum = 0;
                        for(j = -radius; j <= radius; j++){
                            k = x + j;
                            if(k >= 0 && k < width){//ȷ�� k û���� x �ķ�Χ
                                //r,g,b,a �ĸ�һ��
                                i = (y * width + k) * 4;
                                r += pixes[i] * gaussMatrix[j + radius];
                                g += pixes[i + 1] * gaussMatrix[j + radius];
                                b += pixes[i + 2] * gaussMatrix[j + radius];
                                // a += pixes[i + 3] * gaussMatrix[j];
                                gaussSum += gaussMatrix[j + radius];
                            }
                        }
                        i = (y * width + x) * 4;
                        // ���� gaussSum ��Ϊ���������ڱ�Ե������, ��˹���㲻�������
                        // console.log(gaussSum)
                        pixes[i] = r / gaussSum;
                        pixes[i + 1] = g / gaussSum;
                        pixes[i + 2] = b / gaussSum;
                        // pixes[i + 3] = a ;
                    }
                }
                //y ����һά��˹����
                for (x = 0; x < width; x++) {
                    for (y = 0; y < height; y++) {
                        r = g = b = a = 0;
                        gaussSum = 0;
                        for(j = -radius; j <= radius; j++){
                            k = y + j;
                            if(k >= 0 && k < height){//ȷ�� k û���� y �ķ�Χ
                                i = (k * width + x) * 4;
                                r += pixes[i] * gaussMatrix[j + radius];
                                g += pixes[i + 1] * gaussMatrix[j + radius];
                                b += pixes[i + 2] * gaussMatrix[j + radius];
                                // a += pixes[i + 3] * gaussMatrix[j];
                                gaussSum += gaussMatrix[j + radius];
                            }
                        }
                        i = (y * width + x) * 4;
                        pixes[i] = r / gaussSum;
                        pixes[i + 1] = g / gaussSum;
                        pixes[i + 2] = b / gaussSum;
                        // pixes[i] = r ;
                        // pixes[i + 1] = g ;
                        // pixes[i + 2] = b ;
                        // pixes[i + 3] = a ;
                    }
                }
                //end
                imgData.data = pixes;
                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: ���ұ�Ե
 *
 * */
;(function(Ps){

    window[Ps].module("borderline",function(P){

        var M = {
            process: function(imgData,arg){
                var template1 = [
                    -2,-4,-4,-4,-2,
                    -4,0,8,0,-4,
                    -4,8,24,8,-4,
                    -4,0,8,0,-4,
                    -2,-4,-4,-4,-2
                ];
                var template2 = [
                        0,		1,		0,
						1,		-4,		1,
						0,		1,		0
                ];
                var template3 = [
                ];
                return P.lib.dorsyMath.applyMatrix(imgData,template2,250);
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:  ������ 
 *
 * */
;(function(Ps){

    window[Ps].module("mosaic",function(P){

        var M = {
            process: function(imgData,arg){//�������ȶԱȶ�
                var R = parseInt(arg[0]) || 3;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                for(var x = 0,n = parseInt(width / xLength);x < n;x ++){

                    for(var y = 0,m = parseInt(height / xLength);y < m;y ++){

                        var average = [],sum = [0,0,0];
                        for(var i = 0;i < xLength;i ++){

                            for(var j = 0;j < xLength;j ++){
                                var realI = (y * xLength + i) * width + x * xLength + j;
                                sum[0] += data[realI * 4];
                                sum[1] += data[realI * 4 + 1];
                                sum[2] += data[realI * 4 + 2];
                            }
                        }
                        average[0] = sum[0] / (xLength * xLength);
                        average[1] = sum[1] / (xLength * xLength);
                        average[2] = sum[2] / (xLength * xLength);

                        for(var i = 0;i < xLength;i ++){

                            for(var j = 0;j < xLength;j ++){
                                var realI = (y * xLength + i) * width + x * xLength + j;
                                data[realI * 4] = average[0];
                                data[realI * 4 + 1] = average[1];
                                data[realI * 4 + 2] = average[2];

                            }
                        }

                    }

                }


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:   �����ɫ 
 *
 * */
;(function(Ps){

    window[Ps].module("noise",function(P){

        var M = {
            process: function(imgData,arg){
                var R = parseInt(arg[0]) || 100;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                //����
                for(var x = 0;x < width;x ++){

                    for(var y = 0;y < height;y ++){
                        
                        var realI = y * width + x;
                        for(var j = 0;j < 3;j ++){
                            var rand = parseInt(Math.random() * R * 2) - R;
                            data[realI * 4 + j] += rand;
                        }

                    }

                }


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: �ͻ� 
 *
 * */
;(function(Ps){

    window[Ps].module("oilPainting",function(P){

        var M = {
            process: function(imgData,arg){
                var R = parseInt(arg[0]) || 16;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;
                var xLength = R * 2 + 1;

                //����
                for(var x = 0;x < width;x ++){

                    for(var y = 0;y < height;y ++){
                        
                        var realI = y * width + x;
                        var gray = 0;
                        for(var j = 0;j < 3;j ++){
                            gray += data[realI * 4 + j];
                        }
                        gray = gray / 3;
                        var every = parseInt(gray / R) * R;
                        for(var j = 0;j < 3;j ++){
                            data[realI * 4 + j] = every;
                        }
                    }

                }


                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: ����RGB ���ͺͶ�  
 *H (-2*Math.PI , 2 * Math.PI)  S (-100,100) I (-100,100)
 * ��ɫԭ��  ��ѡ��ɫ�����е����ز���֮ǰ��ʲôɫ�࣬����ɵ�ǰ���õ�ɫ�࣬Ȼ�󱥺Ͷȱ���������õı��Ͷȣ�����������Ϊԭ���Ļ����ϼ������õ�����
 * */
;(function(Ps){

    window[Ps].module("setHSI",function(P){

        var M = {
            process: function(imgData,arg){//�������ȶԱȶ�
                arg[0] = arg[0] / 180 * Math.PI;
                arg[1] = arg[1] / 100 || 0;
                arg[2] = arg[2] / 100 * 255 || 0;
                arg[3] = arg[3] || false;//��ɫ

                P.lib.dorsyMath.applyInHSI(imgData,function(i){

                    if(arg[3]){
                        i.H = arg[0];
                        i.S = arg[1];
                        i.I += arg[2];
                    }else{
                        i.H += arg[0];
                        i.S += arg[1];
                        i.I += arg[2];
                    }

                });

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:�� 
 *
 * */
;(function(Ps){

    window[Ps].module("sharp",function(P){

        var M = {
            process: function(imgData,arg){
                var lamta = arg[0] || 0.6;
                var data = imgData.data;
                var width = imgData.width;
                var height = imgData.height;

                for(var i = 0,n = data.length;i < n;i += 4){
                    var ii = i / 4;
                    var row = parseInt(ii / width);
                    var col = ii % width;
                    if(row == 0 || col == 0) continue;

                    var A = ((row - 1) *  width + (col - 1)) * 4;
                    var B = ((row - 1) * width + col) * 4;
                    var E = (ii - 1) * 4;

                    for(var j = 0;j < 3;j ++){
                        var delta = data[i + j] - (data[B + j] + data[E + j] + data[A + j]) / 3;
                        data[i + j] += delta * lamta;
                    }
                }

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: �Ҷȴ���
 *
 * */
;(function(Ps){

    window[Ps].module("toGray",function(P){

        var M = {
            process: function(imgData){
                var data = imgData.data;

                for(var i = 0,n = data.length;i < n;i += 4){
                    var gray = parseInt((data[i] + data[i + 1] + data[i + 2]) / 3);
                    data[i + 2] = data[i + 1] = data[i] = gray;
                }

                imgData.data = data;

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description: ��ɫ
 *
 * */
;(function(Ps){

    window[Ps].module("toReverse",function(P){

        var M = {
            process: function(imgData){
                var data = imgData.data;

                for(var i = 0,n = data.length;i < n;i += 4){
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }

                imgData.data = data;

                return imgData;
            }
        };

        return M;

    });

})("psLib");
/*
 * @author: Bin Wang
 * @description:�Ҷ���ֵ ��ֻ��2���Ҷ�ͼ���� 
 *
 * */
;(function(Ps){

    window[Ps].module("toThresh",function(P){

        var M = {
            process: function(imgData,arg){
                imgData = P.lib.toGray.process(imgData);
                var data = imgData.data;

                var arg = arg[0] || 128;
                for(var i = 0,n = data.length;i < n;i ++){
                    if((i + 1) % 4){
                        data[i] = data[i] > arg ? 255 : 0;
                    }
                }

                imgData.data = data;

                return imgData;
            }
        };

        return M;

    });

})("psLib");
