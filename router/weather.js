const express=require('express');
const http=require('http');
const dfs_xy_conv = require('../Convert'); //이부분은 위도,경도에 대한 정보를 x,y값으로 바꿔주는 모듈입니다.
const router=express.Router();


let today=new Date();  //년,월,일등의 시간과 관련된 부분입니다.
let url="http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst"; //날짜와 api주소부분입니다.
let query=''; //이곳에 위에 해당하는 매개변수를 저장할 예정입니다

let ziourl='https://api.vworld.kr/req/address'; //위도,경도값을 구할수 있는 api주소입니다.
let zioParams=''; //이곳에 위에 파라미터들을 저장합니다.

//이 곳은 주소를 입력시 해당 장소에 x,y좌표를 조회하여 줍니다.
router.get('/',(req,res,next)=>{ //이 라우터에 루트경로로 호출시 GET 요청을 처리해줍니다.
    let type=req.query.type; // 도로명주소로 작성할지 지번주소로 작성할지 선택합니다.
    if(type=='지번명'){ //지번명으로 입력시
        type=encodeURIComponent('PARCEL');
    }else if(type =='도로명'){ //도로명으로 입력시
        type=encodeURIComponent('ROAD');
    }else{ //기본값
        type=encodeURIComponent('PARCEL');
    }
    let adr=encodeURIComponent(req.query.address); //정보를 알고싶은 지역에 대해서 작성합니다.
    zioParams='?'+encodeURIComponent('key')+'='+process.env.ZIO; //인증키를 의미합니다.
    zioParams+= '&' + encodeURIComponent('service')+'='+encodeURIComponent('address'); //요청 서비스 명입니다.
    zioParams+= '&' + encodeURIComponent('request')+'='+encodeURIComponent('GetCoord'); //요청 서비스 오퍼레이션 입니다.
    zioParams+= '&' + encodeURIComponent('format')+'='+encodeURIComponent('json'); //반환형태를 JSON으로 반환해줍니다.
    zioParams+= '&' + encodeURIComponent('type')+'='+type; //위에서 입력받은 변수를 입력해 줍니다.
    zioParams+= '&' + encodeURIComponent('address')+'='+adr; 
    zioParams+= '&' + encodeURIComponent('crs')+'='+encodeURIComponent('epsg:4326'); //응답 결과의 좌표를 표시할때 어떤 좌표계로 표시할지를 나타냅니다.

    let zioal=ziourl+zioParams; //URL과 파라미터를 합칩니다.
    https.get(zioal,(apiRes)=>{ //HTTPS모듈로 api에 get요청을 보내비다.
        let data=''; //api호출 결과값을 받을 변수입니다.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk;
        });
        apiRes.on('end',()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            try{
                const result=JSON.parse(data); //json방식으로 변경하여 객체로 생성해줍니다.
                res.status(200).send(result);   //이후 변형된 객체를 정상작동인 200코드와 결과를 보내줍니다.
            }catch(error){
                res.status(500).send({error:'응답오류'});//그런데 만약 위 과정에서 오류가 있을시 에러메세지와 500코드를 전송해줍니다.
            }
             
        });
    }).on('error',(err)=>{ //만약 http자체 불러오는데 오류가 존재시 에러처리 미들웨어로 보냅니다.
        next(err);
    });
});

router.post('/search',(req,res)=>{ //이 부분에서는 단기날씨예보정보를 조회할수 있는 부분입니다.
    let {x,y}=req.body; //body부분을 각각 type,address에 저장하여 줍니다.(위에서 조회한 x(위도),y(경도)값을 작성해 줍니다.)
    const result=dfs_xy_conv("toXY",y,x); //이부분에서 위도경도를 x,y값으로 변환해주기위해 dfs_xy_conv모듈을 통해 변환후 값을 다시 받습니다.

    let year=String(today.getFullYear()); //이 부분들은 초단기예보정보로서 현재 날짜,시간을 기준으로 조회를하게 코드를 구성하였습니다.
    let month=String(today.getMonth()+1); //현재 월을 입력받습니다.
    let daysq=String(today.getDate()); //현재 일을 입력받습니다.

    month = month.padStart(2, '0'); //이 두부분은 숫자가 한자리인것을 대비해 10의자리에 수가 비어있을시 0으로 채워주는 부분입니다.
    daysq = daysq.padStart(2, '0');

    year+=month+daysq;//여기서 해당 변수들을 다 합쳐줍니다.
    console.log(year)

    let time=today.getHours(); //현재 시간을 입력받아 줍니다.
    let min=today.getMinutes(); //현재 분을 입력받습니다.
    if(min<=45) time=time-1; //해당 api에서는 데이터 갱신을 해당시간에 45분이후부터 받을수 있기에 이시간보다 적을시 시 부분을 하나 줄여줍니다.
    if(time<0) time=23; //만약 위에서 -1을했는데 00시라면 23시로 돌립니다.
    let timestring = time.toString().padStart(2, '0') + '30'; //시간,분 부분을 합쳐줍니다.padstart부분은 위와마찬가지로 십의자리에0을 채워줍니다.

    console.log(timestring)
    let mx=String(result.x); //x,y로 변환한 값들을 매개변수 조회를 위해 string으로 변환후 사용합니다.
    let my=String(result.y);
    console.log(mx);
    console.log(my);
    
    query='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY; //인증키를 의미합니다.
    query+= '&' + encodeURIComponent('numOfRows')+'='+encodeURIComponent('10'); //한페이지에 몇개 데이터를 나타낼지 설정합니다.
    query+= '&' + encodeURIComponent('pageNo')+'='+encodeURIComponent('1'); //페이저 넘버입니다.
    query+= '&' + encodeURIComponent('dataType')+'='+encodeURIComponent('JSON'); //반환형태를 JSON으로 반환해줍니다.
    query+= '&' + encodeURIComponent('base_date')+'='+encodeURIComponent(year); //위에서 입력받은 변수를 입력해 줍니다.
    query+= '&' + encodeURIComponent('base_time')+'='+encodeURIComponent(timestring);  //여기는 시간부분변수를 넣습니다.
    query+= '&' + encodeURIComponent('nx')+'='+encodeURIComponent(mx); //x,y값도 차례대로 작성하여 줍니다.
    query+= '&' + encodeURIComponent('ny')+'='+encodeURIComponent(my); 
    
    let urls=url+query;  //api호출을 위해서 주소를 합쳐줍니다.
    http.get(urls,(apiRes)=>{ //HTTPS모듈로 api에 get요청을 보냅니다.
        let data=''; //api호출 결과값을 받을 변수입니다.
        apiRes.on('data',(chunk)=>{ //이벤트 리스너를 등록해 새데이터 도착시마다 data변수에 추가해줍니다.
            data+=chunk; 
        });
        apiRes.on('end',async()=>{ //여기도 이벤트 리스너로서 도착할 데이터 없을시 호출됩니다.
            try{
                const result=JSON.parse(data); //json방식으로 변경하여 객체로 생성해줍니다.
                console.log(result);
                res.status(200).send(result);   //이후 변형된 객체를 정상작동인 200코드와 결과를 보내줍니다.
            }
            catch(error){
                console.log(error);
                res.status(500).send({error:'응답오류'});//그런데 만약 위 과정에서 오류가 있을시 에러메세지와 500코드를 전송해줍니다.
            }
             
        });
    }).on('error',(err)=>{ //만약 http자체 불러오는데 오류시 에러처리 미들웨어에서 처리합니다.
        next(err);
    });
})

module.exports=router;