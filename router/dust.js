const express=require('express');
const http=require('http'); //api에 접근을 위해서 사용합니다.
const router=express.Router(); //라우터로서 분리하여 사용하였기에 반드시 필요합니다.

let url="http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/"; //api 주소입니다.접근을 위해서 작성해놨습니다.
let query=''; //매개변수들을 받을 부분입니다.

router.get('/',(req,res)=>{ //기본경로로 접근시 큰 지역마다 
    url+="http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";
    const location =req.query.location; //시도에 이름을 쿼리스트링으로 작성해주시면 됩니다.(서울,울산,대구,전역등)
    query='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY;  //API호출을 위하여 필요한 매개변수들을 작성합니다.
    query+='&' + encodeURIComponent('returnType')+'='+encodeURIComponent('json'); //반환은 json으로 반환합니다.
    query+='&' + encodeURIComponent('sidoName')+'='+encodeURIComponent(location); //이곳에서 제가 작성한 매개변수를 넣어 사용합니다.
    query+='&' + encodeURIComponent('numOfRows')+'='+encodeURIComponent('100');   //한페이지 출력수 입니다
    query+='&' + encodeURIComponent('pageNo')+'='+encodeURIComponent('1');  //페이지 번호입니다.
    query+='&' + encodeURIComponent('ver')+'='+encodeURIComponent('1.0');  //오퍼레이션의 버전입니다
    const alurl=url+query; //해당 api를 매개변수까지 넣었으니 호출을 위해 합쳐줍니다.

    http.get(alurl,(apiRes)=>{  //이곳에서 get방식으로 해당 api에 요청을 보냅니다.
        let data=''; //api응답으로 받아오는 정보를 수집하기 위해 존재.
        apiRes.on('data',(chunk)=>{
            data+=chunk; //이곳에서 데이터들을 수집하여 줍니다.
        });
        apiRes.on('end',()=>{
            try{ //데이터를 받아오는게 끝나면 실행
                const result=JSON.parse(data); //받아온 데이터를 json객체로 반환.
                res.status(200).send(result);  //정상호출 되었음을 알리는 200번대 번호와 json결과를 반환해줍니다. 
            }catch(error){ //만약 위에서 오류가 있었다면
                res.status(500).send({error:'응답오류'}); //여기서 500과 함께 응답오류를 보냅니다.
            }
             
        });
    }).on('error',(err)=>{ //만약 이 경로에 대한 동작 수행중 에러가 발생시 해당 에러를 에러처리 미들웨어로 보내서 해결합니다.
        next(err);
    });
});

router.get('/ultra',(req,res)=>{ //이 부분은 초미세먼지에 주간예보에 대한 정보를 조회하는 api라우터 부분입니다.
    const day =req.query.day; //조회할 날짜를 파라미터 로서 작성하여 줍니다.(2024-05-05)
    //해당 날짜로부터 4일후까지 예보에 대한 정보를 받을수 있습니다.
    url+="http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustWeekFrcstDspth";
    query='?'+encodeURIComponent('serviceKey')+'='+process.env.KEY;  //API호출을 위하여 필요한 매개변수들을 작성합니다.
    query+='&' + encodeURIComponent('returnType')+'='+encodeURIComponent('json'); //json형식으로 데이터를 받습니다.
    query+='&' + encodeURIComponent('numOfRows')+'='+encodeURIComponent('100'); //한페이지 출력수 입니다
    query+='&' + encodeURIComponent('pageNo')+'='+encodeURIComponent('1'); //페이지 번호입니다.
    query+='&' + encodeURIComponent('searchDate')+'='+encodeURIComponent(day); //작성한 파라미터 부분입니다.
    
    const alurl=url+query; //해당 api접근을 위해 매개변수까지 저장하여 줍니다.

    http.get(alurl,(apiRes)=>{
        let data=''; //api응답으로 받아오는 정보를 수집하기 위해 존재.
        apiRes.on('data',(chunk)=>{
            data+=chunk; //이곳에서 데이터들을 수집하여 줍니다.
        });
        apiRes.on('end',()=>{
            try{ //데이터를 받아오는게 끝나면 실행
                const result=JSON.parse(data); //받아온 데이터를 json객체로 반환.
                res.status(200).send(result);  //정상호출 되었음을 알리는 200번대 번호와 json결과를 반환해줍니다. 
            }catch(error){ //만약 위에서 오류가 있었다면
                res.status(500).send({error:'응답오류'}); //여기서 500과 함께 응답오류를 보냅니다.
            }
             
        });
    }).on('error',(err)=>{
        next(err);
    });
});

module.exports=router