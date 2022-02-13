async function run() {
	var koa = require('koa');
	var Router = require('koa-router');
	var Static = require('koa-static-cache');
	var mysql = require('mysql2/promise');
	var bodyParser = require('koa-bodyparser')
	const fs = require('fs');
	const exec = require('child_process').exec;
	const path = require('path')

	var app = new koa();
	var router = new Router();
	app.use(bodyParser({
		formLimit: "10mb",
		jsonLimit: "10mb"
	}));


	//静态
	app.use(Static('./static', {
		prefix: '/static',
		gzip: true
	}));
	//连接数据库
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '131735qq2',
		database: 'node'
	})

	router.get('/test', async ctx => {
		let [data] = await connection.query('SELECT * FROM users');
		ctx.body = data;
		console.log('test success');
	});
	//修改信息接口get_test

	//注册
	router.post('/post1', async ctx => {
		console.log('post_test success');
		var client_data = ctx.request.body
		.accout_sent; //username is primary key,if enroll two same username,it will error
		var client_url = ctx.request.body.password_sent;
		//let sql='UPDATE websites SET name=? WHERE id=2';
		let sql = "INSERT INTO users (username,password) VALUES('" + client_data + "','" + client_url +
			"')";
		//var value=[client_data,'ddddd'];//猜测此列表是与sql中的？一一对应，有几个？就有几个列表项
		let [data] = await connection.query(sql);
		ctx.body = {
			code: 1,
			data
		}
	});
	//登入
	router.post('/post2', async ctx => {
		console.log('post2_test success');
		var client_data = ctx.request.body.accout_sent; //zhanghao
		var client_url = ctx.request.body.password_sent; //密码
		console.log('账号 密码： ' + client_data + ' ' + client_url)
		var sql = "SELECT * FROM users WHERE username='" + client_data + "'";
		let [data] = await connection.query(sql);
		console.log(data);
		console.log(data == []);
		console.log(data[0].username);
		console.log('the data.length is  ' + data.length);
		if (data.length == 0) {
			//返回错误
			console.log('账号错误');
			ctx.body = {
				code: 0,
				data
			}
		} else {
			/* var sql1="SELECT password FROM users WHERE username='"+ client_url+"'";
			let [data1]=await connection.query(sql1);
			if(data.length!=0){
				//登入成功
				console.log('登入成功');
				ctx.body={
					code:1,
					data1
				}
			}
			else{
				//密码错误
				console.log('密码错误');
				ctx.body={
					code:0,
					data1}
			} */
			console.log('password is ' + data[0].password);
			console.log('password from client is ' + client_url);
			console.log(Number(data[0].password) == Number(client_url))
			if (Number(data[0].password) == Number(client_url)) {
				ctx.body = {
					code: 1,
					data
				};
				console.log('登入成功')
			} else {
				ctx.body = {
					code: 1,
					data
				};
				console.log('密码错误');
			}
		}
	});

	//封装exec
	function doShellCmd(cmd) {
		let str = cmd;
		let result = {};
		return new Promise(function(resolve, reject) {
			exec(str, function(err, stdout, stderr) {
				if (err) {
					console.log('err');
					result.errCode = 500;
					result.data = "操作失败！请重试";
					reject(result);
				} else {
					console.log('stdout ', stdout); //标准输出
					result.errCode = 200;
					result.data = "操作成功！";
					resolve(result);
				}
			})
		})
	}



	var global_data = [
		[1, 2, 3],
		[2, 3, 4]
	];
	// timing client data
	//定时接受数据
	router.post('/post3', async ctx => {
		console.log('timing data success');

		var receive_data = ctx.request.body.test_json;
		var arr_temp = eval(receive_data);
		global_data = arr_temp;
		var str = '';
		for (var i = 0; i < arr_temp.length; i++) {
			for (var j = 0; j < 3; j++) {
				if (j != 2) {
					str += (arr_temp[i][j] + ' ');
				} else {
					str += (arr_temp[i][j] + '\n');
				}

			}
		}
		//console.log('length is '+length);
		fs.writeFile('static/data/timing_data/final_data.txt', str, function(err) {
			console.log(err)
		})
		fs.writeFile('static/data/timing_data/test_data.txt', receive_data, function(err) {
			console.log(err)
		});

		ctx.body = {
			code: 1,

		}

	});
	router.post('/post4', async ctx => {
		console.log('final data success');
		var receive_data = ctx.request.body.test_json;
		var arr_temp = eval(receive_data);
		global_data = arr_temp;
		var str = '';
		for (var i = 0; i < arr_temp.length; i++) {
			for (var j = 0; j < 3; j++) {
				if (j != 2) {
					str += (arr_temp[i][j] + ' ');
				} else {
					str += (arr_temp[i][j] + '\n');
				}

			}
		}
		//console.log('length is '+length);
		fs.writeFile('static/data/final_data.txt', str, function(err) {
			console.log(err)
		})
		fs.writeFile('static/data/test_data.txt', receive_data, function(err) {
			console.log(err)
		});

		ctx.body = {
			code: 1,

		}
	})
	router.get('/test2_98', async (ctx, next) => {
		console.log('test2_98 success');
		//Rscript D:/r_workspace/test2.R
		var R_File_Path = path.join(__dirname, "./test_9.8_file.R");
		var reStartPro = 'Rscript' + ' "' + R_File_Path + '" ';
		var result = await doShellCmd(reStartPro); //调用exec
		console.log("[create file] ", result);


		ctx.response.status = result.errCode;
		ctx.response.body = result.data;
	});
	router.get('/test2', async (ctx, next) => {
		console.log('test2 success');
		//Rscript D:/r_workspace/test2.R
		var R_File_Path = path.join(__dirname, "./test_file.R");
		var reStartPro = 'Rscript' + ' "' + R_File_Path + '" ';
		var result = await doShellCmd(reStartPro); //调用exec
		console.log("[create file] ", result);
	
	
		ctx.response.status = result.errCode;
		ctx.response.body = result.data;
	});
	router.get('/test3', async ctx => {
		fs.readFile('label28.txt', 'utf-8', function(err, label) {
			if (err) {
				return console.error(err);
			}
			console.log("异步读取: " + label.toString());
			var data_label = label.split(/[\s]+/);
			console.log('data_label is ' + data_label);
			//计算各个参数
			var wake = 0;
			var sleep = 0;
			//last element is null
			for (var i = 0; i < data_label.length-1; i++) {
				if (data_label[i] >= 1) {
					wake += 1;
				} else {
					sleep += 1
				}
			}
			// for (var i = 40; i < 60; i++) {
			// 	console.log(data_label[i]);
			// }
			var effience = sleep / (data_label.length-1);
			var tst = data_label.length-1;
			var tst_score = 0;
			var waso_score = 0;
			if (wake >= 100) {
				waso_score = 0;
			} else {
				waso_score = 100 - wake;
			}
			var score_result = 0;
			if (tst >= 480) {
				tst_score = (960 - tst) / 480;
			} else {
				tst_score = tst / 480;
			}
			var sol = 0;
			var sol_score = 0;
			var count = 0;
			console.log('last two is '+data_label[data_label.length-1]+' '+data_label[data_label.length-2]);
			//计算sol
			for (var i = 5; i < data_label.length-1; i++) {
				if (data_label[i] == 0) {
					for (var j = i; j < i + 5; j++) {
						if (data_label[j] != 0) {
							console.log(j + ' is ' + data_label[j])
							break;
						} else {
							count += 1;
							console.log(j + ' is ' + data_label[j] + ' count is ' + count);
						}

					}
					if (count == 5) {
						sol = i;
						console.log(i + ' is ' + data_label[i])
						break;
					}
				}
				count = 0;
			}
			
			//计算sol——score
			if (sol >= 50) {
				sol_score = 0;
			} else {
				sol_score = 100 - sol * 2;
			}
			console.log('wake is '+wake+' sleep is '+sleep+' tst_sc is ' + tst_score + ' sol is ' + sol + ' waso_sc is ' +
				waso_score+' tst '+tst);
		});

	});
	router.get('/test4', async ctx => {
		//八个参数
		var tst_static=0;
		var tst_score=0;
		var sol_static=0;
		var sol_score=0;
		var waso_static=0;
		var waso_score=0;
		var ef_static=0;
		var ef_score=0;
		
		
		
		var arr_str=fs.readFileSync('static/timing_data_history/final_data_29.txt','utf-8')
		var arr=arr_str.split(/[\s]+/);
		console.log('arr length is '+arr.length);
		var temp=new Array();
		for(var i=0;i<arr.length;++i){
					 temp.push(Number(arr[i]));
					 if((i+1)%3==0){
						 global_data.push(temp);
						
						 temp=[];
					 }
					 
		}
		// for(var i=0;i<200;++i){
		// 	console.log(arr[i]);
		// }
		// for(var i=0;i<200;++i){
		// 	console.log(global_data[i]);
		// }
		//数据清洗 线性插值
		var data_af_cl = [
			[global_data[0][0], global_data[0][1], global_data[0][2]]
		];
		console.log(data_af_cl);
		//在线清洗数据
		for (var i = 0; i < global_data.length - 1; ++i) {
			data_af_cl.push(global_data[i]);
			for (var k = 1; k <= 5; ++k) {
				var temp_arr = new Array();
				for (var j = 0; j < 3; ++j) {
					if (j == 0) {
						temp_arr.push((k * 33 - 200) / -200 * global_data[i][0] + (k * 33) / 200 *
							global_data[i + 1][0])
					}
					if (j == 1) {
						temp_arr.push((k * 33 - 200) / -200 * global_data[i][1] + (k * 33) / 200 *
							global_data[i + 1][1])
					}
					if (j == 2) {
						temp_arr.push((k * 33 - 200) / -200 * global_data[i][2] + (k * 33) / 200 *
							global_data[i + 1][2])
					}
				}
				data_af_cl.push(temp_arr);
			}
		}
		
		console.log(data_af_cl);
		console.log('length is '+data_af_cl.length);
		
		
		//遍历用
		// for(var i=0;i<10;i++){
		// 	for(var j=0;j<3;j++){
		// 		console.log('遍历 '+data_af_cl[i][j]);
		// 	}
		// }
		
		var str = '';
		for (var i = 0; i<data_af_cl.length; i++) {
			for (var j = 0; j < 3; j++) {
				if (j != 2) {
					
					
					str += (data_af_cl[i][j] + ' ');
					
				} else {
					str += (data_af_cl[i][j] + '\n');
				}

			}
		}
		fs.writeFileSync('data_after_cleaning29.txt', str);
		//算法调用
		var R_File_Path = path.join(__dirname, "./test_file.R");
		var reStartPro = 'Rscript' + ' "' + R_File_Path + '" ';
		var result = await doShellCmd(reStartPro); //调用exec
		console.log("[create file] ", result);
			//计算参数
		var label=fs.readFileSync('label29.txt','utf-8');
		
			console.log("异步读取: " + label.toString());
			var data_label = label.split(/[\s]+/);
			console.log('data_label is ' + data_label);
			//计算各个参数
			var wake = 0;
			var sleep = 0;
			//last element is null
			for (var i = 0; i < data_label.length-1; i++) {
				if (data_label[i] >= 1) {
					wake += 1;
				} else {
					sleep += 1
				}
			}
			// for (var i = 40; i < 60; i++) {
			// 	console.log(data_label[i]);
			// }
			var effience = sleep / (data_label.length-1);
			var tst = data_label.length-1;
			var tst_sco = 0;
			var waso_sco = 0;
			if (wake >= 100) {
				waso_sco = 0;
			} else {
				waso_sco = 100 - wake;
			}
			var score_result = 0;
			if (tst >= 480) {
				tst_sco = (960 - tst) / 480;
			} else {
				tst_sco = tst / 480;
			}
			var sol = 0;
			var sol_sco = 0;
			var count = 0;
			console.log('last two is '+data_label[data_label.length-1]+' '+data_label[data_label.length-2]);
			//计算sol
			for (var i = 5; i < data_label.length-1; i++) {
				if (data_label[i] == 0) {
					for (var j = i; j < i + 5; j++) {
						if (data_label[j] != 0) {
							console.log(j + ' is ' + data_label[j])
							break;
						} else {
							count += 1;
							console.log(j + ' is ' + data_label[j] + ' count is ' + count);
						}
		
					}
					if (count == 5) {
						sol = i;
						console.log(i + ' is ' + data_label[i])
						break;
					}
				}
				count = 0;
			}
			
			//计算sol——sco
			if (sol >= 50) {
				sol_sco = 0;
			} else {
				sol_sco = 100 - sol * 2;
			}
			console.log('wake is '+wake+' sleep is '+sleep+' tst_sc is ' + tst_sco + ' sol is ' + sol + ' waso_sc is ' +
				waso_sco+' tst '+tst);
			tst_static=tst;
			tst_score=tst_sco*25;
			sol_static=sol;
			sol_score=sol_sco/4;
			ef_static=effience;
			ef_score=effience*25;
			waso_static=wake;
			waso_score=waso_sco/4;
			ctx.body={
				sol:sol_static,
				sol_sc:sol_score,
				eff:ef_static,
				eff_sc:ef_score,
				tst:tst_static,
				tst_sc:tst_score,
				waso:waso_static,
				waso_sc:waso_score
			};
			
			console.log(ctx.body);
		
		// ctx.response.status = result.errCode;
		// ctx.response.body = result.data;
		console.log(ctx.body);
	})

	app.use(router.routes());
	app.listen(8088);
}
run();
