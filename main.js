// ==UserScript==
// @name                Wallhaven One-click download
// @name:zh-CN          Wallhaven 壁纸一键下载
// @name:en             Wallhaven One-click download
// @description         脚本支持在浏览模式下一键下载
// @description:zh-CN   每次保存图片需要点击图片-打开新页面-右键保存????过程太繁琐了!!!此脚本支持在浏览模式下一键下载!!!脚本基于原作者Moshel的脚本"Wallhaven壁纸网站增强"修改完成,只修改了快速下载功能.原脚本已经失效,原作者主页https://github.com/h2y/
// @description:en      This script for faster download of wallpapers from the WallHaven
 
 
// @author              lthero
// @namespace           https://blog.lthero.cn
// @homepageURL         https://blog.lthero.cn
// @supportURL          https://github.com/lthero-big
// @icon                https://alpha.wallhaven.cc/favicon.ico
// @license             GPL-3.0
 
// @include             https://wallhaven.cc/*
// @grant               none
// @run-at              document-end
 
// @date                28/06/2022
// @modified            28/06/2022
// @version             1.3.5
 
// ==/UserScript==
{
    // 图片类 特指列表中的图片
    class Pic {
        constructor(elem, wallhavenScript) {
            this.elem = elem;
            this.wallhavenScript = wallhavenScript;
            const $pic = $(elem);
            this.favs = parseInt( $pic.find('.wall-favs')[0].innerHTML );
            this.seen = $pic.find('figure').hasClass('thumb-seen');
            this.id = $pic.find('figure').data('wallpaper-id');
            this.isPNG = ($pic.find('span.png').length > 0);
            this.pre_id = this.id.substring(0,2);
            this.filename = `wallhaven-${this.id}`;
            this.picUrl = `https://w.wallhaven.cc/full/${this.pre_id}/wallhaven-${this.id}.jpg`;
            if(this.isPNG)
                this.picUrl = this.picUrl.replace('.jpg', '.png');
        }
 
        desalt() {
            const opacity = this.wallhavenScript.desaltPicsOpacity;
            this.elem.style.opacity = opacity;
        }
 
        addDownload() {
            let dlDom = $(`<a class="jsDownload" href="javascript:;" > <i class="fa fa-fw fa-cloud-download"></i></a>`)[0];
            dlDom.onclick = this.download.bind(this);
            $(this.elem).find('.thumb-info').append(dlDom);
        }
 
        download() {
            //下载图片的方法参考：https://codeantenna.com/a/qqraSZTvUb
            var x=new XMLHttpRequest();
            const NfileName=this.filename;
            x.open("GET", this.picUrl, true);
            x.responseType = 'blob';
            x.onload=function(e){
                var url = window.URL.createObjectURL(x.response);
                var a = document.createElement('a');
                a.href = url;
                a.download = `${NfileName}`;
                console.log(`is ${NfileName}`);
                a.click();
            }
            x.send();
        }
    }
 
 
    class WallhavenScript {
        constructor() {
            // 显示一键下载按钮
            this.ShowDownload = true;
        }
 
        workList() {
            this.workListMain();
            new MutationObserver( this.workListMain.bind(this) ).observe(document.body, {
                attributes: false,
                childList: true,
                subtree: true
            });
        }
 
        workListMain() {
            let pics = this.getPics();
            let newPics = this.filterNewPics(pics);
 
            for(let pic of newPics) {
                // 显示一键下载按钮
                if(this.ShowDownload)
                    pic.addDownload();
 
            }
            this.pics = pics;
        }
 
        // 单图页面
        workSingle() {
            if(this.maxView) {
                $('#header, #searchbar').hide('fast');
                $('#showcase-sidebar').animate({top:0}, 'fast');
                $('#main').animate({borderTopWidth:0}, 'fast');
                $('#wallpaper').animate({maxWidth:'99%', maxHight:'99%'}, 'fast');
            }
        }
 
        getPics() {
            let elems = $('.thumb-listing-page li');
            let ret = [];
 
            for(let elem of elems)
                ret.push( new Pic(elem, this) );
 
            return ret;
        }
 
        filterNewPics(pics) {
            let ret = [];
            const oldElems = this.pics.map(pic=>pic.elem);
 
            return pics.filter( pic => {
                return (oldElems.indexOf(pic.elem) < 0);
            });
        }
        /*
            根据当前页面选择需要运行的功能，返回对应的 work 函数
         */
        run() {
            // A: 单图页面
            if(location.pathname.indexOf('/w/')==0)
                return this.workSingle();
            this.pics = [];
            return this.workList();
        }
 
    }
    new WallhavenScript().run();
 
} //end userScript
