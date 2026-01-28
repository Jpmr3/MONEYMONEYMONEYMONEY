<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"><title>SISTEMA DE LIQUIDEZ</title>
    <style>
        body{background:#000;color:#0f0;font-family:monospace;text-align:center;padding:50px 20px;}
        .box{border:1px solid #0f0;padding:30px;border-radius:10px;max-width:400px;margin:auto;box-shadow:0 0 20px #0f0;}
        .btn{background:#0f0;color:#000;padding:15px;width:100%;border:none;font-weight:bold;cursor:pointer;margin-top:20px;border-radius:5px;}
        .bar{background:#222;height:10px;margin:20px 0;border-radius:5px;overflow:hidden;}
        .fill{background:#0f0;height:100%;width:0%;transition:0.5s;}
    </style>
</head>
<body>
    <div class="box">
        <h2>NODO DE PAGO #4192</h2>
        <h1 id="money">€0.00</h1>
        <p>Estado: <span style="color:yellow">Esperando Validación Viral</span></p>
        
        <div class="bar"><div class="fill" id="fill"></div></div>
        
        <button class="btn" id="btn-share" onclick="compartir()">PASO 1: ACTIVAR VIRALIDAD</button>
        <button class="btn" id="btn-claim" style="display:none;background:cyan" onclick="cobrar()">PASO 2: RETIRAR A CUENTA</button>
    </div>

    <script>
        // PEGA TU LINK DE ADSTERRA AQUÍ ABAJO
        const MI_LINK_DE_COBRO = "AQUÍ_PEGA_TU_LINK_DE_ADSTERRA";

        let cash = 0;
        setInterval(() => { cash += 1.55; document.getElementById('money').innerText = "€" + cash.toFixed(2); }, 1000);

        function compartir() {
            window.open("https://api.whatsapp.com/send?text=Mira%20esto,%20están%20pagando%20por%20entrar:%20" + window.location.href);
            document.getElementById('fill').style.width = "100%";
            document.getElementById('btn-share').style.display = "none";
            document.getElementById('btn-claim').style.display = "block";
        }

        function cobrar() {
            window.location.href = MI_LINK_DE_COBRO;
        }
    </script>
</body>
</html>
