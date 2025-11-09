
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					return await KV(request, env, 'LINK.txt');
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt') {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

				const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<style>
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						
						body {
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							min-height: 100vh;
							padding: 20px;
							font-size: 14px;
							line-height: 1.6;
						}
						
						.container {
							max-width: 1200px;
							margin: 0 auto;
							background: rgba(255, 255, 255, 0.98);
							border-radius: 20px;
							box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
							overflow: hidden;
						}
						
						.header {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							padding: 30px;
							text-align: center;
						}
						
						.header h1 {
							font-size: 28px;
							font-weight: 600;
							margin-bottom: 10px;
							text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
						}
						
						.header p {
							opacity: 0.9;
							font-size: 14px;
						}
						
						.content {
							padding: 30px;
						}
						
						.section {
							margin-bottom: 30px;
							padding: 25px;
							background: #f8f9fa;
							border-radius: 12px;
							border-left: 4px solid #667eea;
						}
						
						.section-title {
							font-size: 18px;
							font-weight: 600;
							color: #333;
							margin-bottom: 20px;
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.section-title::before {
							content: '';
							width: 4px;
							height: 20px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							border-radius: 2px;
						}
						
						.subscription-item {
							background: white;
							padding: 15px;
							margin-bottom: 15px;
							border-radius: 8px;
							box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
							transition: all 0.3s ease;
						}
						
						.subscription-item:hover {
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
							transform: translateY(-2px);
						}
						
						.subscription-label {
							font-weight: 600;
							color: #667eea;
							margin-bottom: 8px;
							font-size: 13px;
							text-transform: uppercase;
							letter-spacing: 0.5px;
						}
						
						.subscription-link {
							color: #667eea;
							text-decoration: none;
							word-break: break-all;
							font-size: 13px;
							display: inline-block;
							padding: 8px 12px;
							background: #f0f4ff;
							border-radius: 6px;
							transition: all 0.3s ease;
						}
						
						.subscription-link:hover {
							background: #667eea;
							color: white;
							transform: scale(1.02);
						}
						
						.qrcode-container {
							display: flex;
							justify-content: center;
							margin: 15px 0;
							padding: 15px;
							background: white;
							border-radius: 8px;
							display: none;
						}
						
						.qrcode-container.active {
							display: flex;
						}
						
						.editor-container {
							width: 100%;
							margin: 20px 0;
						}
						
						.editor {
							width: 100%;
							height: 400px;
							padding: 15px;
							border: 2px solid #e0e0e0;
							border-radius: 8px;
							font-size: 13px;
							font-family: 'Courier New', monospace;
							line-height: 1.6;
							resize: vertical;
							transition: border-color 0.3s ease;
							background: white;
						}
						
						.editor:focus {
							outline: none;
							border-color: #667eea;
							box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
						}
						
						.save-container {
							margin-top: 15px;
							display: flex;
							align-items: center;
							gap: 15px;
						}
						
						.save-btn {
							padding: 12px 30px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							border: none;
							border-radius: 8px;
							cursor: pointer;
							font-size: 14px;
							font-weight: 600;
							transition: all 0.3s ease;
							box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
						}
						
						.save-btn:hover:not(:disabled) {
							transform: translateY(-2px);
							box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
						}
						
						.save-btn:disabled {
							opacity: 0.6;
							cursor: not-allowed;
						}
						
						.save-status {
							color: #666;
							font-size: 13px;
							padding: 8px 15px;
							background: #f0f4ff;
							border-radius: 6px;
						}
						
						.toggle-btn {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							padding: 10px 20px;
							border: none;
							border-radius: 8px;
							cursor: pointer;
							font-size: 14px;
							font-weight: 600;
							transition: all 0.3s ease;
							display: inline-block;
							text-decoration: none;
						}
						
						.toggle-btn:hover {
							transform: translateY(-2px);
							box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
						}
						
						.info-box {
							background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
							padding: 15px 20px;
							border-radius: 8px;
							border-left: 4px solid #667eea;
							margin: 10px 0;
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.info-box-icon {
							font-size: 20px;
						}
						
						.copy-hint {
							text-align: center;
							color: #999;
							font-size: 12px;
							margin-top: 10px;
							font-style: italic;
						}
						
						.config-info {
							background: white;
							padding: 15px;
							border-radius: 8px;
							margin: 10px 0;
						}
						
						.config-info strong {
							color: #667eea;
						}
						
						.divider {
							height: 2px;
							background: linear-gradient(90deg, transparent, #667eea, transparent);
							margin: 20px 0;
						}
						
						.footer {
							background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
							padding: 25px 20px;
							text-align: center;
							color: #666;
							font-size: 12px;
							border-top: 1px solid #e0e0e0;
						}
						
						.footer p {
							margin: 5px 0;
						}
						
						.stats {
							display: grid;
							grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
							gap: 15px;
							margin-bottom: 20px;
						}
						
						.stat-card {
							background: white;
							padding: 20px;
							border-radius: 10px;
							box-shadow: 0 2px 8px rgba(0,0,0,0.05);
							text-align: center;
							transition: all 0.3s ease;
						}
						
						.stat-card:hover {
							transform: translateY(-3px);
							box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
						}
						
						.stat-icon {
							font-size: 32px;
							margin-bottom: 10px;
						}
						
						.stat-label {
							color: #999;
							font-size: 12px;
							margin-bottom: 5px;
						}
						
						.stat-value {
							font-size: 18px;
							font-weight: 600;
							color: #667eea;
						}
						
						.badge {
							display: inline-block;
							padding: 4px 10px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							border-radius: 20px;
							font-size: 12px;
							font-weight: 600;
							margin-left: 10px;
						}
						
						@media (max-width: 768px) {
							body {
								padding: 10px;
							}
							
							.header {
								padding: 20px;
							}
							
							.header h1 {
								font-size: 22px;
							}
							
							.content {
								padding: 15px;
							}
							
							.section {
								padding: 15px;
							}
							
							.editor {
								height: 300px;
							}
						}
						
						@keyframes fadeIn {
							from {
								opacity: 0;
								transform: translateY(20px);
							}
							to {
								opacity: 1;
								transform: translateY(0);
							}
						}
						
						.section {
							animation: fadeIn 0.5s ease;
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>🚀 ${FileName}</h1>
							<p>订阅管理与配置中心</p>
						</div>
						<div class="content">
						<div class="info-box">
							<div class="info-box-icon">💡</div>
							<div>
								<strong>使用说明</strong><br>
								<span style="color: #666; font-size: 13px;">点击下方订阅链接可自动复制到剪贴板，并显示二维码供扫描使用</span>
							</div>
						</div>
						
						<div class="stats">
							<div class="stat-card">
								<div class="stat-icon">📱</div>
								<div class="stat-label">订阅类型</div>
								<div class="stat-value">6种</div>
							</div>
							<div class="stat-card">
								<div class="stat-icon">🔄</div>
								<div class="stat-label">更新时间</div>
								<div class="stat-value">${SUBUpdateTime}小时</div>
							</div>
							<div class="stat-card">
								<div class="stat-icon">🌐</div>
								<div class="stat-label">当前域名</div>
								<div class="stat-value" style="font-size: 14px; word-break: break-all;">${url.hostname}</div>
							</div>
						</div>
						
						<div class="section">
							<div class="section-title">
								📱 订阅地址
								<button onclick="copyAllLinks()" style="margin-left: auto; padding: 6px 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">📋 复制全部</button>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">🔄 自适应订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}','qrcode_0')" class="subscription-link">https://${url.hostname}/${mytoken}</a>
								<div id="qrcode_0" class="qrcode-container"></div>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">📋 Base64订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')" class="subscription-link">https://${url.hostname}/${mytoken}?b64</a>
								<div id="qrcode_1" class="qrcode-container"></div>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">⚔️ Clash订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')" class="subscription-link">https://${url.hostname}/${mytoken}?clash</a>
								<div id="qrcode_2" class="qrcode-container"></div>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">📦 Singbox订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')" class="subscription-link">https://${url.hostname}/${mytoken}?sb</a>
								<div id="qrcode_3" class="qrcode-container"></div>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">🌊 Surge订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qrcode_4')" class="subscription-link">https://${url.hostname}/${mytoken}?surge</a>
								<div id="qrcode_4" class="qrcode-container"></div>
							</div>
							
							<div class="subscription-item">
								<div class="subscription-label">🎈 Loon订阅</div>
								<a href="javascript:void(0)" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qrcode_5')" class="subscription-link">https://${url.hostname}/${mytoken}?loon</a>
								<div id="qrcode_5" class="qrcode-container"></div>
							</div>
						</div>
						
						<div class="section">
							<div class="section-title">⚙️ 订阅转换配置</div>
							<div class="config-info">
								<div style="display: flex; align-items: center; gap: 10px;">
									<span style="font-size: 18px;">🔧</span>
									<div style="flex: 1;">
										<div style="color: #999; font-size: 12px; margin-bottom: 3px;">订阅转换后端</div>
										<strong style="color: #667eea;">${subProtocol}://${subConverter}</strong>
									</div>
								</div>
							</div>
							<div class="config-info">
								<div style="display: flex; align-items: center; gap: 10px;">
									<span style="font-size: 18px;">📝</span>
									<div style="flex: 1;">
										<div style="color: #999; font-size: 12px; margin-bottom: 3px;">订阅配置文件</div>
										<strong style="color: #667eea; word-break: break-all; font-size: 13px;">${subConfig}</strong>
									</div>
								</div>
							</div>
						</div>
						
						<div class="section">
							<div class="section-title">✏️ 订阅内容编辑</div>
							<div class="editor-container">
								${hasKV ? `
								<textarea class="editor" 
									placeholder="请在此输入节点链接或订阅地址，每行一个...&#10;&#10;示例：&#10;vless://...&#10;trojan://...&#10;https://订阅地址"
									id="content">${content}</textarea>
								<div class="save-container">
									<button class="save-btn" onclick="saveContent(this)">💾 保存配置</button>
									<span class="save-status" id="saveStatus"></span>
								</div>
								` : '<p style="padding: 20px; text-align: center; color: #666;">请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
							</div>
						</div>
						</div>
						<div class="footer">
							<div style="margin-bottom: 10px;">
								<strong style="color: #667eea;">CF-Workers-SUB</strong>
								<span class="badge">v2.0</span>
							</div>
							<p style="color: #999;">Powered by Cloudflare Workers</p>
							<p style="font-size: 11px; color: #aaa; margin-top: 10px;">UA: ${request.headers.get('User-Agent')}</p>
						</div>
					</div>
					<script>
					function copyAllLinks() {
						const allLinks = [
							'自适应订阅: https://${url.hostname}/${mytoken}',
							'Base64订阅: https://${url.hostname}/${mytoken}?b64',
							'Clash订阅: https://${url.hostname}/${mytoken}?clash',
							'Singbox订阅: https://${url.hostname}/${mytoken}?sb',
							'Surge订阅: https://${url.hostname}/${mytoken}?surge',
							'Loon订阅: https://${url.hostname}/${mytoken}?loon'
						].join('\\n\\n');
						
						navigator.clipboard.writeText(allLinks).then(() => {
							const toast = document.createElement('div');
							toast.textContent = '✓ 已复制所有订阅链接';
							toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; font-size: 14px; font-weight: 600;';
							document.body.appendChild(toast);
							setTimeout(() => toast.remove(), 2000);
						}).catch(err => {
							console.error('复制失败:', err);
							alert('复制失败，请手动复制');
						});
					}
					
					function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							// 创建美化的提示
							const toast = document.createElement('div');
							toast.textContent = '✓ 已复制到剪贴板';
							toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 10000; font-size: 14px; font-weight: 600;';
							document.body.appendChild(toast);
							setTimeout(() => toast.remove(), 2000);
						}).catch(err => {
							console.error('复制失败:', err);
							alert('复制失败，请手动复制');
						});
						
						const qrcodeDiv = document.getElementById(qrcode);
						// 切换二维码显示
						if (qrcodeDiv.classList.contains('active')) {
							qrcodeDiv.classList.remove('active');
							qrcodeDiv.innerHTML = '';
						} else {
							// 隐藏其他二维码
							document.querySelectorAll('.qrcode-container').forEach(div => {
								div.classList.remove('active');
								div.innerHTML = '';
							});
							// 显示当前二维码
							qrcodeDiv.classList.add('active');
							qrcodeDiv.innerHTML = '';
							new QRCode(qrcodeDiv, {
								text: text,
								width: 200,
								height: 200,
								colorDark: "#667eea",
								colorLight: "#ffffff",
								correctLevel: QRCode.CorrectLevel.H
							});
						}
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent(button) {
							try {
								const updateButtonText = (step) => {
									button.textContent = \`保存中: \${step}\`;
								};
								// 检测是否为iOS设备
								const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
								
								// 仅在非iOS设备上执行replaceFullwidthColon
								if (!isIOS) {
									replaceFullwidthColon();
								}
								updateButtonText('开始保存');
								button.disabled = true;

								// 获取textarea内容和原始内容
								const textarea = document.getElementById('content');
								if (!textarea) {
									throw new Error('找不到文本编辑区域');
								}

								updateButtonText('获取内容');
								let newContent;
								let originalContent;
								try {
									newContent = textarea.value || '';
									originalContent = textarea.defaultValue || '';
								} catch (e) {
									console.error('获取内容错误:', e);
									throw new Error('无法获取编辑内容');
								}

								updateButtonText('准备状态更新函数');
								const updateStatus = (message, isError = false) => {
									const statusElem = document.getElementById('saveStatus');
									if (statusElem) {
										statusElem.textContent = message;
										statusElem.style.color = isError ? 'red' : '#666';
									}
								};

								updateButtonText('准备按钮重置函数');
								const resetButton = () => {
									button.textContent = '保存';
									button.disabled = false;
								};

								if (newContent !== originalContent) {
									updateButtonText('发送保存请求');
									fetch(window.location.href, {
										method: 'POST',
										body: newContent,
										headers: {
											'Content-Type': 'text/plain;charset=UTF-8'
										},
										cache: 'no-cache'
									})
									.then(response => {
										updateButtonText('检查响应状态');
										if (!response.ok) {
											throw new Error(\`HTTP error! status: \${response.status}\`);
										}
										updateButtonText('更新保存状态');
										const now = new Date().toLocaleString();
										document.title = \`编辑已保存 \${now}\`;
										updateStatus(\`已保存 \${now}\`);
									})
									.catch(error => {
										updateButtonText('处理错误');
										console.error('Save error:', error);
										updateStatus(\`保存失败: \${error.message}\`, true);
									})
									.finally(() => {
										resetButton();
									});
								} else {
									updateButtonText('检查内容变化');
									updateStatus('内容未变化');
									resetButton();
								}
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								const statusElem = document.getElementById('saveStatus');
								if (statusElem) {
									statusElem.textContent = \`错误: \${error.message}\`;
									statusElem.style.color = 'red';
								}
							}
						}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}

					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}