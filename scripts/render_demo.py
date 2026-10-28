from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess, sys, shutil

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'video-work'; SLIDES=WORK/'slides'; AUDIO=WORK/'audio'; SEGMENTS=WORK/'segments'
OUT=ROOT/'dist'/'demo'; SHOTS=ROOT/'dist'/'screenshots'
for p in (SLIDES,AUDIO,SEGMENTS,OUT,SHOTS): p.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT/'.video-tools'))
import imageio_ffmpeg
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
W,H=1920,1080
BG='#161617'; SURFACE='#1c1c1e'; LINE='#2c2c30'; TEXT='#fafafa'; MUTED='#a1a1aa'; GOLD='#f4b728'; BLUE='#6ec1ff'; PAPER='#fffefb'; INK='#201515'
FONT=Path('C:/Windows/Fonts/segoeui.ttf'); BOLD=Path('C:/Windows/Fonts/seguisb.ttf'); BLACK=Path('C:/Windows/Fonts/segoeuib.ttf'); MONO=Path('C:/Windows/Fonts/consola.ttf')
def font(size,bold=False,mono=False): return ImageFont.truetype(str(MONO if mono else (BLACK if bold else FONT)),size)
def text(draw,xy,value,size=42,color=TEXT,bold=False,mono=False,anchor=None):
    draw.text(xy,value,font=font(size,bold,mono),fill=color,anchor=anchor,spacing=8)
def round(draw,box,r,fill,outline=None,width=1): draw.rounded_rectangle(box,r,fill=fill,outline=outline,width=width)
SLIDE_NO=0
def base(kicker,title,sub=''):
    global SLIDE_NO
    SLIDE_NO+=1
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    text(d,(120,90),kicker,22,GOLD,True,True)
    text(d,(120,145),title,78,TEXT,True)
    if sub:text(d,(123,250),sub,31,MUTED)
    text(d,(120,1015),'CASHDROP  ·  ZCASH TESTNET',18,MUTED,True,True)
    text(d,(1800,1015),'%02d / 08'%SLIDE_NO,18,MUTED,True,True,anchor='ra')
    return im,d
def envelope(d,x,y,w=650,h=400,amount='0.0100'):
    round(d,(x,y,x+w,y+h),12,PAPER)
    d.line((x,y,x+w//2,y+h*.57),fill='#b8b1a2',width=3);d.line((x+w,y,x+w//2,y+h*.57),fill='#b8b1a2',width=3)
    text(d,(x+35,y+30),'CASHDROP',18,INK,True,True);text(d,(x+w-35,y+30),'FOR YOU',18,INK,True,True,anchor='ra')
    text(d,(x+w/2,y+145),amount,72,INK,True,True,anchor='mm');text(d,(x+w/2+180,y+145),'ZEC',25,INK,True,anchor='lm')
    d.ellipse((x+w/2-60,y+h/2-20,x+w/2+60,y+h/2+100),fill=GOLD,outline='#d89b13',width=10);text(d,(x+w/2,y+h/2+38),'↓',50,INK,True,anchor='mm')
def browser(d,x,y,w,h,title='CashDrop — Testnet web app'):
    round(d,(x,y,x+w,y+h),24,'#11110f',LINE,2);round(d,(x,y,x+w,y+70),24,'#22221d');d.rectangle((x,y+45,x+w,y+70),fill='#22221d')
    for i,c in enumerate(('#ff6b5f','#f4b729','#62d487')):d.ellipse((x+24+i*28,y+27,x+40+i*28,y+43),fill=c)
    text(d,(x+125,y+34),title,19,MUTED,anchor='lm')
    return (x,y+70,x+w,y+h)
slides=[]
im,d=base('CASHDROP V3 · LIVE TESTNET','Private money, delivered as a link.','A redesigned browser-native product for shielded ZEC.')
envelope(d,1120,360,650,400);round(d,(120,390,875,720),28,SURFACE,LINE,2);text(d,(170,445),'No account.',43,TEXT,True);text(d,(170,525),'No extension.',43,TEXT,True);text(d,(170,605),'No public payment graph.',43,GOLD,True);slides.append(im)
im,d=base('WHY ZCASH','Privacy is the product.','A payment should not publish who paid whom.')
round(d,(120,350,850,850),28,'#10100e',LINE,2);text(d,(165,395),'TESTNET EXPLORER VIEW',20,MUTED,True,True)
rows=[('TYPE','SHIELDED'),('SENDER','████████████'),('RECIPIENT','███████████████'),('AMOUNT','██████'),('CASHDROP?','████████')]
for i,(a,b) in enumerate(rows): y=475+i*72;text(d,(165,y),a,20,MUTED,mono=True);text(d,(800,y),b,20,TEXT,mono=True,anchor='ra')
text(d,(1040,400),'Zcash hides',34,TEXT,True);text(d,(1040,460),'sender · recipient · amount',42,GOLD,True);text(d,(1040,570),'CashDrop keeps both sides\ninside the shielded pool.',36,TEXT,True);slides.append(im)
im,d=base('STEP 1 · CREATE','Seal a private envelope.','Choose an amount, note, optional password, and deadline.')
browser(d,760,340,1030,590);text(d,(815,455),'Create a CashDrop',42,TEXT,True);text(d,(815,525),'AMOUNT IN TESTNET ZEC',17,MUTED,True,True);round(d,(815,560,1735,630),14,SURFACE,LINE,2);text(d,(845,595),'0.0100',31,TEXT,mono=True,anchor='lm');text(d,(815,685),'PRIVATE NOTE',17,MUTED,True,True);round(d,(815,720,1735,790),14,SURFACE,LINE,2);text(d,(845,755),'Thanks for helping with the launch',24,TEXT,anchor='lm');round(d,(120,400,620,670),26,GOLD);text(d,(165,445),'PASSWORD LOCK',20,INK,True,True);text(d,(165,510),'The key is not\nin the link.',46,INK,True);slides.append(im)
im,d=base('STEP 2 · FUND + SHARE','Fund it. Save recovery. Send privately.','Treat the complete unlocked link like a folded banknote.')
envelope(d,110,370,680,420);round(d,(900,360,1800,820),28,SURFACE,LINE,2);text(d,(955,415),'SEND EXACTLY',18,MUTED,True,True);text(d,(955,470),'0.0101 ZEC',58,GOLD,True,True);text(d,(955,575),'utest1f3ts7uw0…h7es9ap8dw',23,TEXT,mono=True);round(d,(955,655,1335,720),99,GOLD);text(d,(1145,687),'SAVE RECOVERY',20,INK,True,anchor='mm');round(d,(1360,655,1740,720),99,'#272720',LINE,2);text(d,(1550,687),'COPY PRIVATE LINK',19,TEXT,True,anchor='mm');slides.append(im)
im,d=base('STEP 3 · RECEIVE','Open, unlock, and sweep.','The proof and transaction are built locally in the recipient browser.')
browser(d,115,345,1690,570);text(d,(180,455),'You received a CashDrop',46,TEXT,True);text(d,(180,535),'0.0100',76,TEXT,True,True);text(d,(515,535),'ZEC',27,GOLD,True);round(d,(180,635,1740,720),15,SURFACE,LINE,2);text(d,(215,677),'utest1… recipient shielded address',26,MUTED,mono=True,anchor='lm');round(d,(180,770,560,840),99,GOLD);text(d,(370,805),'CLAIM PRIVATELY',22,INK,True,anchor='mm');text(d,(820,805),'scan  →  prove  →  broadcast',25,BLUE,True,True,anchor='lm');slides.append(im)
im,d=base('PRIVATE COMMERCE','Checkout. Then verify locally.','A real shielded point of sale, not a simulated paid screen.')
round(d,(120,355,870,865),24,SURFACE,LINE,2);text(d,(165,400),'CHECKOUT REQUEST',19,GOLD,True,True);text(d,(165,470),'Ada’s Coffee',42,TEXT,True);text(d,(165,535),'Coffee and pastry',27,MUTED);text(d,(165,625),'0.0100',66,TEXT,True,True);text(d,(445,625),'ZEC',24,GOLD,True);round(d,(165,720,560,790),99,GOLD);text(d,(362,755),'SCAN TO PAY',20,INK,True,anchor='mm')
round(d,(960,355,1800,865),24,'#10100f',GOLD,2);text(d,(1010,400),'LOCAL MERCHANT VERIFICATION',18,MUTED,True,True);text(d,(1010,490),'CONFIRMED',62,GOLD,True,True);text(d,(1010,585),'14 confirmations · Orchard',22,MUTED,mono=True);text(d,(1010,655),'0.0100 ZEC',42,TEXT,True,True);text(d,(1010,745),'Seed stays on this device',22,TEXT,True);text(d,(1010,790),'No customer database',22,TEXT,True);slides.append(im)
im,d=base('SEVEN MODES · ONE PRIVACY MODEL','Built for Monday, not just a demo.','New Plans and Checkout join the complete CashDrop product suite.')
cards=[('CASHDROP','Gifts + private payments'),('DROPBATCH','Rewards + private payroll'),('PRIVATE FUND','Raise without a donor graph'),('CHECKOUT','Exact-price point of sale'),('PLANS','Customer-approved renewals'),('VERIFY','Confirmed · pending · underpaid')]
for i,(a,b) in enumerate(cards): x=120+(i%3)*570;y=340+(i//3)*275;round(d,(x,y,x+520,y+225),22,GOLD if i==4 else SURFACE,GOLD if i==4 else LINE,2);text(d,(x+28,y+32),a,19,INK if i==4 else GOLD,True,True);text(d,(x+28,y+95),b,28,INK if i==4 else TEXT,True)
slides.append(im)
im,d=base('OPEN SOURCE · LIVE TESTNET','CashDrop makes shielded payments feel human.','WebZjs + librustzcash · AES-GCM · PBKDF2 · static PWA')
text(d,(W/2,475),'PRIVATE MONEY,',76,TEXT,True,anchor='mm');text(d,(W/2,575),'DELIVERED AS A LINK.',76,GOLD,True,anchor='mm');round(d,(690,700,1230,785),99,GOLD);text(d,(960,742),'TRY CASHDROP',25,INK,True,anchor='mm');text(d,(W/2,875),'www.cashdrop.live',25,MUTED,mono=True,anchor='mm');slides.append(im)
for i,im in enumerate(slides,1):
    p=SLIDES/f'slide-{i:02d}.png';im.save(p,quality=95)
for i in (1,3,4,5,6,7): shutil.copy2(SLIDES/f'slide-{i:02d}.png',SHOTS/f'{i:02d}-cashdrop.png')
for i in range(1,9):
    slide=SLIDES/f'slide-{i:02d}.png'; audio=AUDIO/f'segment-{i:02d}.wav'; seg=SEGMENTS/f'segment-{i:02d}.mp4'
    cmd=[FFMPEG,'-y','-loop','1','-framerate','30','-i',str(slide),'-i',str(audio),'-c:v','libx264','-tune','stillimage','-preset','veryfast','-crf','18','-c:a','aac','-b:a','192k','-pix_fmt','yuv420p','-shortest','-movflags','+faststart',str(seg)]
    subprocess.run(cmd,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
concat=WORK/'concat.txt';concat.write_text('\n'.join(f"file '{(SEGMENTS/f'segment-{i:02d}.mp4').as_posix()}'" for i in range(1,9)),encoding='utf-8')
final=OUT/'cashdrop-demo.mp4'
subprocess.run([FFMPEG,'-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(final)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(final)
