import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Themes {
  private renderer:Renderer2;
  private currentTheme:'light'|'dark';

  constructor(rendererFactory:RendererFactory2){
    this.renderer = rendererFactory.createRenderer(null,null);
    this.currentTheme = 'dark';
    this.setTheme(this.currentTheme);
  }

  private setTheme(theme:'light'|'dark'){
    
    this.renderer.removeClass(document.body,this.currentTheme);

    this.renderer.addClass(document.body,theme);

    this.currentTheme = theme;

  }

  public toggleTheme(){
    let theme:'light'|'dark' = this.currentTheme=='light'?'dark':'light';
    this.setTheme(theme);
  }

  public getCurrentTheme():'light'|'dark'{
    return this.currentTheme;
  }

}
