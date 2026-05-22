const logger = require('./logger/loggers.js');
const transporter  = require('../config/mail.config.js');
const emailQueue = require('../queue/email.queue.js');

//Enviar mail al eliminar un producto
const sendEmailDeleteProduct = async (email, product) =>{
    try{
        return await emailQueue.add("sendMail",
            generateFormatEmail(email, {
                subject: "Producto Borrado",
                head: "El Producto fue borrado correctamente",
                body: `El producto "${product.title}" con código "${product.code}" fue borrado. Por el administrador. El producto pertenece al usuario con email ${email}. Si no solicitaste la eliminación de este producto, por favor contacta con el soporte.`,
            })
        )
    }catch(error){
        throw error
    }
}

const sendEmailPurchase = async (email, ticket) =>{
    try{
       return await emailQueue.add("sendMail",
            generateFormatEmail(email, {
                subject: "Compra realizada con éxito",
                head: "¡Gracias por tu compra!",
                body: `Tu compra con código de orden "${ticket.code}" fue procesada con éxito. A continuación encontrarás los detalles de tu compra:\n\n${formatPurchaseEmail(ticket)}\n\nSi no reconocés esta actividad o tenés alguna duda, respondé este email y te ayudamos a la brevedad.`,
            })
        )
    }catch(error){
        throw error
    }
} 

const sendMailRecoverPass = async (email, secret) =>{
    try{
        return await emailQueue.add("sendMail",
            generateFormatEmail(email, {
                subject: "Recuperación de contraseña",
                head: "Solicitud de recuperación de contraseña",
                body: `Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si fuiste vos, hacé clic en el siguiente enlace para crear una nueva contraseña:\n\n${process.env.URL_FRONTEND}/users/generatepassword?secret=${secret}&email=${email}\n\nSi no solicitaste restablecer tu contraseña, por favor ignorá este email o contactá con el soporte si tenés alguna duda.`,
            })
        )
    }catch(error){
        throw error;
    }
}

const sendMailChangedPass = async (email) =>{
    try{
        return await emailQueue.add("sendMail",
            generateFormatEmail(email, {
                subject: "Contraseña actualizada",
                head: "Tu contraseña fue actualizada con éxito",
                body: `Te informamos que la contraseña de tu cuenta fue actualizada correctamente. Si fuiste vos, no es necesario que hagas nada más. Si no reconocés esta actividad o tenés alguna duda, respondé este email y te ayudamos a la brevedad.`,
            })
        )
    }catch(error){
        throw error;
    }
}

const formatPurchaseEmail = (purchase) => {
    const date = new Date(purchase.purchase_datetime);
    const formattedDate = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const productsRows = purchase.products.map(p => `
        <tr>
            <td style="padding:12px 8px;border-bottom:1px solid #e8edf3;color:#444;font-size:14px;">${p.title}</td>
            <td style="padding:12px 8px;border-bottom:1px solid #e8edf3;color:#444;font-size:14px;text-align:center;">x${p.quantity}</td>
            <td style="padding:12px 8px;border-bottom:1px solid #e8edf3;color:#1e3c72;font-size:14px;font-weight:700;text-align:right;">
                $${parseFloat(p.price).toLocaleString('es-AR')}
            </td>
        </tr>
    `).join('');

    return `
        <!-- Info del pedido -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e8edf3;">
                    <span style="color:#888;font-size:13px;">N° de pedido</span><br>
                    <span style="color:#1e3c72;font-size:14px;font-weight:700;">${purchase.code}</span>
                </td>
            </tr>
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e8edf3;">
                    <span style="color:#888;font-size:13px;">Comprador</span><br>
                    <span style="color:#333;font-size:14px;font-weight:600;">${purchase.purchaser.name} ${purchase.purchaser.last_name}</span>
                    <span style="color:#888;font-size:13px;"> · ${purchase.purchaser.email}</span>
                </td>
            </tr>
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e8edf3;">
                    <span style="color:#888;font-size:13px;">Fecha y hora</span><br>
                    <span style="color:#333;font-size:14px;">${formattedDate} a las ${formattedTime}</span>
                </td>
            </tr>
        </table>

        <!-- Productos -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <thead>
                <tr style="background:#f0f4f8;">
                    <th style="padding:10px 8px;text-align:left;color:#1e3c72;font-size:13px;">Producto</th>
                    <th style="padding:10px 8px;text-align:center;color:#1e3c72;font-size:13px;">Cant.</th>
                    <th style="padding:10px 8px;text-align:right;color:#1e3c72;font-size:13px;">Precio</th>
                </tr>
            </thead>
            <tbody>
                ${productsRows}
            </tbody>
        </table>

        <!-- Total -->
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="padding:16px 8px;background:#1e3c72;border-radius:10px;text-align:right;">
                    <span style="color:rgba(255,255,255,0.75);font-size:14px;margin-right:16px;">Total abonado</span>
                    <span style="color:#ffffff;font-size:20px;font-weight:700;">
                        $${parseFloat(purchase.total).toLocaleString('es-AR')}
                    </span>
                </td>
            </tr>
        </table>
    `;
};

const generateFormatEmail = (email, payload) => {
    const mailOptions = {
        from: `Tienda de Productos <${process.env.GMAIL_CREDENTIAL_USER}>`,
        to: `${email}`,
        subject: `${payload.subject}`,
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

            <!-- Wrapper -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                            <!-- Header -->
                            <tr>
                                <td align="center" style="background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);padding:40px 40px 30px;border-radius:20px 20px 0 0;">
                                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                                        Tienda de Productos
                                    </h1>
                                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                                        ${payload.subject}
                                    </p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="background:#ffffff;padding:40px;">

                                    <h2 style="margin:0 0 16px;color:#1e3c72;font-size:22px;font-weight:700;">
                                        ${payload.head}
                                    </h2>

                                    <p style="margin:0 0 24px;color:#444444;font-size:16px;line-height:1.7;">
                                        ${payload.body}
                                    </p>

                                    <hr style="border:none;border-top:1px solid #e8edf3;margin:32px 0;">

                                    <p style="margin:0;color:#888888;font-size:13px;line-height:1.6;">
                                        Si no reconocés esta actividad o tenés alguna duda, respondé este email y te ayudamos a la brevedad.
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background:#1e3c72;padding:24px 40px;border-radius:0 0 20px 20px;">
                                    <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;">
                                        © ${new Date().getFullYear()} Tienda de Productos · Todos los derechos reservados
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>

        </body>
        </html>
        `,
        attachments: []
    };
    return mailOptions;
};

module.exports = {
    sendEmailDeleteProduct,
    sendEmailPurchase,
    sendMailRecoverPass,
    sendMailChangedPass
}