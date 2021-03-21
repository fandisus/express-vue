export class TopMenu {
  public showLogo = true;
  public barColor = 'blue';
  public menus:Array<MenuItem>;
  public leftLogo:string|undefined;
  public rightLogo:string|undefined;
  constructor(showLogo?:boolean, barColor?:string, menus?:Array<MenuItem>) {
    if (showLogo) this.showLogo = showLogo;
    if (barColor) this.barColor = barColor;
    if (menus) this.menus = menus; else this.menus = [];
  }
}
export class MenuItem {
  public href:string;
  public text:string;
  public icon:string;
  constructor(href:string, text:string, icon?:string) {
    this.href = href; this.text = text; this.icon = icon || '';
  }
}