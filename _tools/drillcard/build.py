import base64,io,sys,re
from PIL import Image
A='/mnt/user-data/attachments/e5162ec3-bd0d-5abd-b593-14a7e788cee3/'
S1=Image.open(A+'ddb32fdc-image.png').convert('RGB'); S2=Image.open(A+'1e808e6b-image.png').convert('RGB')
k=S1.width/2000
def card(n):  # n 1..8 ; returns crop right of the number label
    col=(n-1)%4; row=(n-1)//4
    x0=[25,517,1009,1501][col]; y0=[77,342][row]
    return S1.crop((int((x0+90)*k),int((y0+14)*k),int((x0+470)*k),int((y0+226)*k)))
def bg(n):
    col=(n-1)%2; row=(n-1)//2
    x0=[22,735][col]; y0=[19,550][row]
    return S2.crop((x0+90,y0+90,x0+680,y0+500))
def b64(im,w,q=80):
    im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS); b=io.BytesIO(); im.save(b,'JPEG',quality=q,optimize=True,progressive=True)
    return base64.b64encode(b.getvalue()).decode()
COMMON=('.reveal,.reveal.timed{background:none;border-left:0;border-radius:0;box-shadow:none;text-align:center;border-top:0;padding:.9rem .5rem .2rem;margin-top:.5rem}'
 '.vg-timeup{color:#8a6d1f}.vg-others>span{color:#4a5a7a;font-size:.9rem}.reveal-also{font-size:.95rem}'
 '.aph-qcard{position:relative}')
FRAME={'plain':'',
 'deck':('.aph-qcard::before{content:"";position:absolute;inset:7px;border:1px solid rgba(201,168,76,.55);border-radius:9px;pointer-events:none}'
  '.aph-qcard{box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 9px 20px rgba(26,39,68,.12),0 7px 0 -3px #f6f1e4,0 8px 0 -3px rgba(201,168,76,.5),0 14px 0 -6px #eee7d4,0 15px 0 -6px rgba(201,168,76,.4)!important;margin-bottom:18px}'),
 'thick':('.aph-qcard{border:1px solid rgba(201,168,76,.6);background-blend-mode:normal;'
  'box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -2px 4px rgba(120,95,40,.12),inset 1px 0 0 rgba(255,255,255,.6),'
  '0 1px 0 #e9e0c8,0 2px 0 #e3d9bd,0 3px 0 #dcd1b1,0 4px 0 #d5c9a6,0 5px 0 #cfc29c,0 6px 0 #c7ba92,'
  '0 14px 22px rgba(26,39,68,.22),0 26px 40px rgba(26,39,68,.14)!important;margin-bottom:26px}'
  '.aph-qcard::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;'
  'background:linear-gradient(155deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,0) 38%,rgba(120,95,40,.07) 100%)}'),
 'fan':('.aph-drill-main{position:relative;isolation:isolate}'
  '.aph-qcard{box-shadow:0 10px 24px rgba(26,39,68,.20),0 2px 4px rgba(26,39,68,.12)!important;margin-bottom:26px}'
  '.aph-qcard::before,.aph-qcard::after{content:"";position:absolute;inset:0;border-radius:14px;z-index:-1;border:1px solid rgba(201,168,76,.55);background:#f7f2e6;box-shadow:0 6px 14px rgba(26,39,68,.14)}'
  '.aph-qcard::before{transform:rotate(-1.6deg) translateY(5px)}.aph-qcard::after{transform:rotate(1.3deg) translateY(9px);background:#efe8d6}'),
 'gold':('.aph-qcard{border:1px solid #c9a84c;'
  'box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 0 0 1px rgba(255,255,255,.5),'
  '0 1px 0 #e6cf86,0 2px 0 #d9bd6a,0 3px 0 #cdae52,0 4px 0 #bf9f43,0 5px 0 #b08f36,0 6px 0 #9f7f2d,'
  '0 15px 24px rgba(26,39,68,.26),0 28px 40px rgba(26,39,68,.14)!important;margin-bottom:26px}'
  '.aph-qcard::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;'
  'background:linear-gradient(155deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,0) 40%,rgba(120,95,40,.06) 100%)}'),
 'gilt':('.aph-qcard{border:5px solid transparent;background:url(@@T@@) center/cover padding-box,linear-gradient(135deg,#f6e3a1 0%,#d4b25a 22%,#a7852f 45%,#ecd186 62%,#b8963c 80%,#f1da92 100%) border-box;'
  'box-shadow:inset 0 0 0 1px rgba(120,90,25,.55),inset 0 2px 5px rgba(120,90,25,.22),'
  '0 1px 0 #d9bd6a,0 2px 0 #cdae52,0 3px 0 #bf9f43,0 4px 0 #b08f36,0 5px 0 #9f7f2d,0 6px 0 #8a6c25,'
  '0 16px 24px rgba(26,39,68,.26),0 30px 42px rgba(26,39,68,.14)!important;margin-bottom:28px}'),
 'gilt2':('.aph-qcard{border:5px solid transparent;background:url(@@T@@) center/cover padding-box,linear-gradient(135deg,#f6e3a1 0%,#d4b25a 22%,#a7852f 45%,#ecd186 62%,#b8963c 80%,#f1da92 100%) border-box;'
  'box-shadow:inset 0 0 0 1px rgba(120,90,25,.55),inset 0 2px 5px rgba(120,90,25,.22),'
  '0 1px 0 #d9bd6a,0 2px 0 #cdae52,0 3px 0 #bf9f43,0 4px 0 #b08f36,0 5px 0 #9f7f2d,0 6px 0 #8a6c25,'
  '0 16px 24px rgba(26,39,68,.26),0 30px 42px rgba(26,39,68,.14)!important;margin-bottom:28px}'
  '.aph-qcard::before{content:"";position:absolute;inset:6px;border:1px solid rgba(26,39,68,.45);border-radius:7px;pointer-events:none}'
  '.aph-qcard::after{content:"";position:absolute;inset:9px;border:1px solid rgba(201,168,76,.8);border-radius:5px;pointer-events:none}'),
 'cert':('.aph-qcard::before{content:"";position:absolute;inset:8px;border:1.5px solid rgba(26,39,68,.55);border-radius:8px;pointer-events:none}'
  '.aph-qcard::after{content:"";position:absolute;inset:12px;border:1px solid rgba(201,168,76,.7);border-radius:5px;pointer-events:none}'
  '.aph-qcard{box-shadow:0 8px 22px rgba(26,39,68,.14),0 1px 3px rgba(26,39,68,.1)!important}')}
def css(c,g,style='plain'):
    r=('<style id="ap-drillcard">'
    '.aph-drill{background:url(data:image/jpeg;base64,%s) center/cover;min-height:calc(100vh - 150px)}'
    '.aph-qcard{background:#fffdf8 url(data:image/jpeg;base64,%s) center/cover;border:1px solid rgba(201,168,76,.55);'
    'box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 6px 18px rgba(26,39,68,.10),0 1px 3px rgba(26,39,68,.08)}'
    '</style>')%(b64(bg(g),900,72),b64(card(c),1000,82))
    return r.replace('</style>',COMMON+FRAME[style].replace('@@T@@','data:image/jpeg;base64,'+b64(card(c),1000,82))+'</style>')
def inject(path,c,g,style='plain'):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'<style id="ap-drillcard">.*?</style>','',s,flags=re.S)
    s=s.replace('</head>',css(c,g,style)+'</head>',1)
    open(path,'w',encoding='utf-8').write(s)
if __name__=='__main__':
    inject(sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4] if len(sys.argv)>4 else 'plain')


# ---- ChatGPT frame mode: 9-slice border-image from a card-frame PNG (transparent corners) ----
def frame_css(png,slice_px,bw,radius,g=2,pad=None):
    import io,base64
    im=Image.open(png).convert('RGBA'); w=900; im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); u='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
    k=w/Image.open(png).width; sl=int(round(slice_px*k))
    return ('<style id="ap-drillcard">'
      '.aph-drill{background:url(data:image/jpeg;base64,%s) center/cover;min-height:calc(100vh - 150px)}'
      '.aph-qcard{position:relative;border:%dpx solid transparent;border-image:url(%s) %d fill / %dpx stretch;background:none;border-radius:%dpx;'
      'box-shadow:0 12px 22px rgba(26,39,68,.20),0 2px 4px rgba(26,39,68,.12);margin-bottom:22px;padding:8px 18px 12px;isolation:isolate}.aph-qcard::before{content:"";position:absolute;inset:0;z-index:-1;background:rgba(255,253,246,.42);pointer-events:none}'
      %(b64(bg(g),900,72),bw,u,sl,bw,radius)+COMMON+'</style>')
def inject_frame(path,png,slice_px,bw,radius,g=2):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'<style id="ap-drillcard">.*?</style>','',s,flags=re.S)
    s=s.replace('</head>',frame_css(png,slice_px,bw,radius,g)+'</head>',1)
    open(path,'w',encoding='utf-8').write(s)
