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
def css(c,g):
    return ('<style id="ap-drillcard">'
    '.aph-drill{background:url(data:image/jpeg;base64,%s) center/cover;min-height:calc(100vh - 150px)}'
    '.aph-qcard{background:#fffdf8 url(data:image/jpeg;base64,%s) center/cover;border:1px solid rgba(201,168,76,.55);'
    'box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 6px 18px rgba(26,39,68,.10),0 1px 3px rgba(26,39,68,.08)}'
    '</style>')%(b64(bg(g),900,72),b64(card(c),1000,82))
def inject(path,c,g):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'<style id="ap-drillcard">.*?</style>','',s,flags=re.S)
    s=s.replace('</head>',css(c,g)+'</head>',1)
    open(path,'w',encoding='utf-8').write(s)
if __name__=='__main__':
    inject(sys.argv[1],int(sys.argv[2]),int(sys.argv[3]))
