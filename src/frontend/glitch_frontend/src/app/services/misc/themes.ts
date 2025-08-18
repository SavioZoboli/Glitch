import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Themes {
  private renderer:Renderer2;
  private currentTheme:'light'|'dark';

  constructor(rendererFactory:RendererFactory2){
    this.renderer = rendererFactory.createRenderer(null,null);
    this.currentTheme = 'light';
  }

  setTheme(theme:'light'|'dark'){
    
    this.renderer.removeClass(document.body,this.currentTheme);

    this.renderer.addClass(document.body,theme);

    this.currentTheme = theme;

    console.log(this.currentTheme)

  }

  toggleTheme(){
    let theme:'light'|'dark' = this.currentTheme=='light'?'dark':'light';
    this.setTheme(theme);
  }

}
