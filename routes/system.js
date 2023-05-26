const express = require('express');
const Joi = require('joi');
const { reject } = require('underscore');
const mysql = require('mysql');
const router = express.Router();


const conn = require("../dbConfig");
const { date } = require('joi');


router.get('/:CID/:macAddress', (req,res)=>{
        const schema = Joi.object({
                cid: Joi.string()
                    .min(15)
                    .max(17)
                    .required()
                    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            
                macaddress: Joi.string()
                        .required()
        });
        async function val(){
                try {
                        const value = await schema.validateAsync({ cid: req.params.CID, macaddress: req.params.macAddress });
                        const layer1Value = await cheakInfo(req.params.CID,req.params.macAddress);
                        const layer2Value = await cheaksubs(layer1Value.companyID);
                        const layer3Value = await getInfo(layer1Value.companyID);

                        await res.send({success : true,
                                        noOfDays : layer2Value,
                                        data : {
                                                company : layer1Value,
                                                serverInfo : layer3Value
                                                },
                                        error : null
                                });
                        
                    }
                    catch (err) { 
                        res.status(400).send({
                                success : false,
                                error : err
                                });
                     }
        }

        val();
        function cheakInfo(cid,macadress) {
                return new Promise((resolve,reject)=>{
                        function layer1(){
                                try{
                                        conn.query("select companyClients.*,companies.* from companyClients inner join companies on companyClients.companyID = companies.id where companyClients.macAddress = '"+macadress+"';",(err,result)=>{
                                                if(err) {
                                                        reject({status : 3306,
                                                                message : err});
                                                }else if(Object.keys(result).length === 0) {
                                                        reject({status : 1,
                                                                message : "Unknown Computer."
                                                        });
                                                }else if(result[0].companyStatus === 0){
                                                        reject({status : 2,
                                                                message : "Blocked Company."
                                                        });
                                                }else if(result[0].status === 0){
                                                        reject({status : 3,
                                                                message : "Blocked Computer."
                                                        });
                                                }else if(result[0].companyCode !== cid){
                                                        reject({status : 4,
                                                                message : "This Pc does not belong to this Company"
                                                        });
                                                }else{
                                                        resolve({companyID : result[0].companyID,
                                                                companyName : result[0].companyName,
                                                                isVisaActive : result[0].isVisaEnabled,
                                                                isFRActive : result[0].isFREnabled
                                                        });
                                                }
                                        });
                                }catch(err){
                                        reject({status : 3306,
                                                message : err});
                                }

                        }
                        layer1();
                });
          };


          function cheaksubs(companyID) {
                return new Promise((resolve,reject)=>{
                        function layer2(){
                                try{
                                        conn.query("select * from billing where companyID = "+companyID+" ORDER BY id DESC LIMIT 1;",(err,result)=>{

                                                        var expDate = result[0].expiredDate;
                                                        var today = Date.parse(new Date());
                                                        var noOfMs = expDate - today;
                                                        var noOfDays = noOfMs/ (1000 * 3600 * 24);

                                                        if(Math.ceil(noOfDays) < 0){
                                                                reject({status : 5,
                                                                message : "Licence Expired."
                                                        });
                                                        }else{
                                                                resolve(Math.ceil(noOfDays));
                                                        }
                                        });
                                }catch(err){
                                        reject({status : 3306,
                                                message : err});
                                }
                        }
                        layer2();
                });
          };


          function getInfo(companyID) {
                return new Promise((resolve,reject)=>{
                        function layer3(){
                                try{
                                        conn.query("select * from serverInfo where companyID = "+companyID+";",(err,result)=>{

                                                        resolve({serverIP : result[0].ipAddress,
                                                                port : result[0].port,
                                                                dbUsername : result[0].username,
                                                                dbPassword : result[0].passwd,
                                                                dbName : result[0].dbName
                                                        });
                                        });
                                }catch(err){
                                        reject({status : 3306,
                                                message : err});
                                }
                        }
                        layer3();
                });
          };
});


module.exports = router;