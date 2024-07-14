import express, {Response, Request, NextFunction} from "express"
import { MercadoPagoConfig, Payment, } from 'mercadopago';
import cors from "cors"
import multer from "multer"
import path from "path"
import knex from "knex"
import {createServer} from "http"
import { Server, Socket } from "socket.io"
import bcrypt from "bcryptjs"
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import { v4 as uuidv4 } from 'uuid';


dotenv.config()
const server = express()
const corsOptions = {
  origin: ["https://www.conexaoastralmistica.com.br", "167.88.32.149"],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
}
server.use(cors(corsOptions))
server.use(express.json())
const httpServer = createServer(server)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "https://www.conexaoastralmistica.com.br",
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
})

const db = knex({
  client: "mysql",
  connection: {
    host: "167.88.32.149",
    port: 3306,
    user: "rafael2",
    password: process.env.MYSQL_SENHA,
    database: "conexao",
  },
  log: {
    warn(message) {},
    error(message) {},
    deprecate(message) {},
    debug(message) {},
  },
});


const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN : "", options: { timeout: 5000 } });
const payment = new Payment(client);



interface ServerToClientEvents {
  serverMsg: (data: {msg: string, room: string}) => void,
  novaSala: (data: {newRoom: string, createdById: string, idProfissional: number}) => void,
  novaMensagem: (data: {novoHistorico: string}) => void,
  mudStatus: (data: {status: string, id: number}) => void,
  salaEncerrada: (data: {msg: string, idSala: string}) => void,
  precoTempoServMsg: (data: {preco: number, tempo: number}) => void,
  erroMsg: (data: {erroMsg: string}) => void,
  clienteChamando: (data: {idProfissional: number, nomeCliente: string, idCliente: number}) => void,
  respostaAtendente: (data: {msg: string, idCliente: number, idProfissional: number}) => void
}


interface ClientToServerEvents {
  acionaMudStatus: (data: {status: string, id: number}) => void,
  clientMsg: (data: {msg: string, room: string}) => void,
  adicionarNaSala: (data: {room: string}) => void,
  tempoPreco: (data: {tempo: number, preco: number, room: string}) => void,
  chamarAtendente: (data: {idProfissional: number, nomeCliente: string, idCliente: number}) => void,
  respostaChamarAtendente: (data: {msg:  string, idCliente: number, idProfissional: number}) => void
}

io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {

  socket.on("clientMsg", async (data: {msg: string, room: string}) => {

    if(Number(data.room) > 0){
      if(data.msg == ""){
        //Se a msg vier vazia, só retorna o historico
        const arrNovoHistorico = await db("salas").select("historico").where({idSala: data.room})
        console.log("sala: " + data.room)
        if(arrNovoHistorico){
          if(arrNovoHistorico[0]){
            const novoHistorico = arrNovoHistorico[0].historico
            io.sockets.to(data.room).emit("novaMensagem", {novoHistorico})
          }else{
            io.sockets.to(data.room).emit("novaMensagem", {novoHistorico: ""}) 
          }
        }else{
          io.sockets.to(data.room).emit("novaMensagem", {novoHistorico: ""})
        }
      }else{
        //Caso venha uma mensagem de fato
        io.sockets.to(data.room).emit("serverMsg", data)
        const arrTextoAtual = await db("salas").select("historico").where({idSala: data.room}) 
        let novoHistorico
        if(arrTextoAtual[0] !== undefined){
          if(arrTextoAtual[0].historico){
            novoHistorico = arrTextoAtual[0].historico + "||n||" + data.msg
          }else{
            novoHistorico = "" + "||n||" + data.msg
          }
        }else{
          novoHistorico = "" + "||n||" + data.msg
        }
        console.log("sala q mandaram do front: " + data.room)
        await db("salas").where({idSala: data.room}).update({historico: novoHistorico}) 
        const arrNovoHistorico = await db("salas").select("historico").where({idSala: data.room})
        console.log(arrNovoHistorico)
        if(arrNovoHistorico){
          novoHistorico = arrNovoHistorico[0].historico
        }
        io.sockets.to(data.room).emit("novaMensagem", {novoHistorico})
      }
    }


  })

  socket.on("acionaMudStatus", (data: {status: string, id: number}) => {
    io.sockets.emit("mudStatus", {status: data.status, id: data.id})
  })

  socket.on("adicionarNaSala", (data: {room: string}) => {
    socket.join(data.room)
    console.log("a sala é " + data.room)
  })

  socket.on("chamarAtendente", (data: {idProfissional: number, nomeCliente: string, idCliente: number}) => {
    console.log("id do profissional solicitado: " + data.idProfissional)
    io.sockets.emit("clienteChamando", {idProfissional: data.idProfissional, nomeCliente: data.nomeCliente, idCliente: data.idCliente})
  })

  socket.on("respostaChamarAtendente", (data: {msg: string, idCliente: number, idProfissional: number}) => {
    io.sockets.emit("respostaAtendente", {msg: data.msg, idCliente: data.idCliente, idProfissional: data.idProfissional})
  })

  socket.on("tempoPreco", (data: {tempo: number, preco: number, room: string}) => {
    io.sockets.to(data.room).emit("precoTempoServMsg", {preco: data.preco, tempo: data.tempo})
    try{
      db("salas").update({tempoConsulta: data.tempo, precoConsulta: data.preco}).where({idSala: Number(data.room)})
    }catch(err){
      io.sockets.to(data.room).emit("erroMsg", {erroMsg: "ocorreu um erro ao colocar os dados do tempo de consulta no banco de dados. é recomendado que o processo de iniciar a consulta seja feito novamente"})
    }

  })
  
})

async function confereTokenAtendente(req: Request, res: Response, next: NextFunction){    
  const auth = req.headers['authorization']

  if(!auth){
      return res.json(["erro", "parece que você não tem autorização"])
  }

  const [type, token] = auth.split(' ')


  if(type !== 'Bearer'){
      return res.json(["erro", "tipo diferente de Bearer"])
  }

  if(!process.env.SECRET_ATENDENTE){
      return res.json(["erro", "problema ao procurar secret no servidor"])
  }

  try{
      const payload = jwt.verify(token, process.env.SECRET_ATENDENTE)
      if(typeof payload == 'string'){
          return res.json(["erro", "algo de errado com o token"])
      }

      const tokenDecod = tokenAtendenteDecodificado(req, res)

      
      if(tokenDecod.id == 0){
        return res.json(["erro", "ocorreu algum erro ao verificar o token"])
      }

      try{
        const arrSalasProf = await db("salas").select().where({id_profissional: tokenDecod.id})

        if(arrSalasProf.length > 0){
          await db("profissionais").update({status: "ocupado"}).where({id: tokenDecod.id})
          io.sockets.emit("mudStatus", {status: "ocupado", id: tokenDecod.id})
        }else{
          await db("profissionais").update({status: "online"}).where({id: tokenDecod.id})
          io.sockets.emit("mudStatus", {status: "online", id: tokenDecod.id})
        }



        next()
      }catch(err){
        return res.json(["erro", "erro ao setar status do atendente. Por favor, tente novamente"])
      }
      

  }catch(err){
      return res.json(["erro", "erro ao verificar o token com o jwt"])
  }
}


function confereTokenUsuario(req: Request, res: Response, next: NextFunction){    
  const auth = req.headers['authorization']

  if(!auth){
      return res.json(["erro", "parece que você não tem autorização"])
  }

  const [type, token] = auth.split(' ')


  if(type !== 'Bearer'){
      return res.json(["erro", "tipo diferente de Bearer"])
  }

  if(!process.env.SECRET_USUARIO){
      return res.json(["erro", "problema ao procurar secret no servidor"])
  }

  try{
      const payload = jwt.verify(token, process.env.SECRET_USUARIO)
      if(typeof payload == 'string'){
          return res.json(["erro", "algo de errado com o token"])
      }

      next()
  }catch(err){
      return res.json(["erro", "erro ao verificar o token com o jwt"])
  }
}


function confereTokenAdmGeral(req: Request, res: Response, next: NextFunction){    
  const auth = req.headers['authorization']

  if(!auth){
      return res.json(["erro", "parece que você não tem autorização"])
  }

  const [type, token] = auth.split(' ')


  if(type !== 'Bearer'){
      return res.json(["erro", "tipo diferente de Bearer"])
  }

  if(!process.env.SECRET_ADM_GERAL){
      return res.json(["erro", "problema ao procurar secret no servidor"])
  }

  try{
      const payload = jwt.verify(token, process.env.SECRET_ADM_GERAL)
      if(typeof payload == 'string'){
          return res.json(["erro", "algo de errado com o token"])
      }

      next()
  }catch(err){
      return res.json(["erro", "erro ao verificar o token com o jwt"])
  }
}


function tokenAtendenteDecodificado(req: Request, res: Response): {id: number, email: string, iat: number, exp: number} | JwtPayload{
  const auth = req.headers['authorization']
  if(!auth){
    return res.json(["erro", "autorização negada, por favor tente se logar novamente"])
  }
  const [type, token] = auth.split(' ')

    try{
      const tokenDecodificado = jwt.verify(token, process.env.SECRET_ATENDENTE || "")
      if(typeof tokenDecodificado == "string"){
        return {id: 0, email: "", iat: 0, exp: 0}
      }else{
        return tokenDecodificado
      }
    }catch(err){
      return {id: 0, email: "", iat: 0, exp: 0}
    }
}

function tokenUsuarioDecodificado(req: Request, res: Response): {id: number, email: string, iat: number, exp: number} | JwtPayload{

  const auth = req.headers['authorization']
  if(!auth){
    return res.json(["erro", "autorização negada, por favor tente se logar novamente"])
  }
  const [type, token] = auth.split(' ')

  try{
    const tokenDecodificado = jwt.verify(token, process.env.SECRET_USUARIO || "")
    if(typeof tokenDecodificado == "string"){
      return {id: 0, email: "", iat: 0, exp: 0}
    }else{
      return tokenDecodificado
    }
  }catch(err){
    return {id: 0, email: "", iat: 0, exp: 0}
  }
}

function tokenAdmGeralDecodificado(req: Request, res: Response): {id: number, email: string, iat: number, exp: number} | JwtPayload{

  const auth = req.headers['authorization']
  if(!auth){
    return res.json(["erro", "autorização negada, por favor tente se logar novamente"])
  }
  const [type, token] = auth.split(' ')

  try{
    const tokenDecodificado = jwt.verify(token, process.env.SECRET_ADM_GERAL || "")
    if(typeof tokenDecodificado == "string"){
      return {id: 0, email: "", iat: 0, exp: 0}
    }else{
      return tokenDecodificado
    }
  }catch(err){
    return {id: 0, email: "", iat: 0, exp: 0}
  }
}


server.get("/", (req:Request, res:Response) => {
    res.send("api funcionando")
})

server.get("/confereTokenAdmGeral", confereTokenAdmGeral, (req: Request, res: Response) => {
  res.json(["sucesso", "acesso liberado"])
})

server.get("/confereTokenAtendente", confereTokenAtendente, (req: Request, res: Response) => {
  res.json(["sucesso", "acesso liberado"])
})

server.get("/confereTokenUsuario", confereTokenUsuario, (req: Request, res: Response) => {
  res.json(["sucesso", "acesso liberado"])
})


server.post("/cadastrarUsuario", async (req: Request, res: Response) => {
  const {emailUsuCadastrar, senhaUsuCadastrar, nomeUsuCadastrar, dataNas} = req.body

  try{
    const arrEmailsCadastrados = await db("usuarios").select("email")
    if(arrEmailsCadastrados.every(item => item.email !== emailUsuCadastrar)){

      await db("usuarios").insert({nome: nomeUsuCadastrar, email: emailUsuCadastrar, dataNas})
      const arrIdUsuAtual = await db("usuarios").select("id").where({email: emailUsuCadastrar})

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(senhaUsuCadastrar, salt, async function(err, hash) {
            if(err){
                res.json(["erro", "não foi possível cadastrar a senha"])
                return
            }else{
                //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
                await db('loginusuario').insert({email: emailUsuCadastrar, hash, id_usuario: arrIdUsuAtual[0].id}) 
                return res.json(["sucesso", "cadastro feito com sucesso"])
            }
        });
      });
    }else{
      return res.json(["erro", "esse email já está cadastrado"])
    }
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao inserir os valores no banco de dados, por favor, tente novamente. Caso persista contate o suporte."])
  }
})

server.post("/cadastrarAdm", async (req: Request, res: Response) => {
  const {emailUsuCadastrar, senhaUsuCadastrar, nomeUsuCadastrar} = req.body

  try{
    const arrEmailsCadastrados = await db("admgeral").select("email")
    if(arrEmailsCadastrados.every(item => item.email !== emailUsuCadastrar)){

      await db("admgeral").insert({nome: nomeUsuCadastrar, email: emailUsuCadastrar})
      const arrIdUsuAtual = await db("admgeral").select("id").where({email: emailUsuCadastrar})

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(senhaUsuCadastrar, salt, async function(err, hash) {
            if(err){
                res.json(["erro", "não foi possível cadastrar a senha"])
                return
            }else{
                //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
                await db('loginadmgeral').insert({email: emailUsuCadastrar, hash, id_admGeral: arrIdUsuAtual[0].id}) 
                return res.json(["sucesso", "cadastro feito com sucesso"])
            }
        });
      });
    }else{
      return res.json(["erro", "esse email já está cadastrado"])
    }
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao inserir os valores no banco de dados, por favor, tente novamente. Caso persista contate o suporte."])
  }
})



/* Rotas ADM */

server.use(express.static(path.resolve("public")));

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    return cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploadImg = multer({ storage });




server.get("/pegarTrabalhos", async (req: Request, res: Response) => {
    try{
      let arrTrabalhos = await db("trabalhos").select("trabalho")
      res.json(["sucesso", arrTrabalhos])
    }catch(err){
      res.json(["erro", "ocorreu um erro: " + err])
    }
})

server.get("/listaClientes", confereTokenAdmGeral, async (req: Request, res: Response) => {
  try{
    const arrClientes = await db("usuarios").select("nome", "email", "saldo", "id")
    res.json(["sucesso", arrClientes])

  }catch(err){
    res.json(["erro", "não foi possível pegar os dados dos clientes. Por favor, tente novamente"])
  }
})


server.post("/alterarSaldo", confereTokenAdmGeral, async (req: Request, res: Response) => {
  const {novoSaldo, idMudarSaldo} = req.body

  try{
    await db("usuarios").update({saldo: novoSaldo, previsaoSaldo: novoSaldo}).where({id: idMudarSaldo})
    return res.json(["sucesso", "saldo atualizado com sucesso!"])
  }catch(err){
    return res.json(["erro", "não foi possível atualizar o saldo. Por favor, tente novamente"])
  }

})


server.post("/postarBlog", uploadImg.single("imgPost"), async (req: Request, res: Response) => {

  console.log(req.body)

  
  console.log("o nome é: " + req.file?.filename)

  const {titulo, desc} = req.body

    const arrTitulos = await db("posts").select("titulo")
    if(arrTitulos.some(item => item.titulo == titulo)){
      res.json(["erro", "já existe um post com esse título"])
      return
    }


    await db("posts").insert({titulo, texto: desc})
    const arrIdPost = await db("posts").select("id").where({titulo})
    console.log(arrIdPost)
    await db("imagensblog").insert({path_img_blog: req.file?.filename, id_post: arrIdPost[0].id})

    res.json(["sucesso", "postado com sucesso"])
})

server.post("/cadastrarTrabalho", uploadImg.array("files"), async (req: Request, res: Response) => {
    const {novoTrabalho} = req.body

    let arrFilenames: string[] = [];

    (req.files as Array<Express.Multer.File>).map(
      (item: { filename: string }) => arrFilenames.push(item.filename)
    );

    try{
      let arrTrabalhos = await db("trabalhos").select("trabalho")
      if(arrTrabalhos.every(item => item.trabalho !== novoTrabalho)){
        await db("trabalhos").insert({trabalho: novoTrabalho})
        const arrIdNovoTrabalho = await db("trabalhos").select("id").where({trabalho: novoTrabalho})
        if(!arrIdNovoTrabalho || !(arrIdNovoTrabalho[0].id)){
          return res.json(["erro", "ocorreu um erro. Por favor, tente novamente"])
        }
        const idNovoTrabalho = arrIdNovoTrabalho[0].id
        arrFilenames.forEach(async (item, index) => {
          await db("urlstrabalhos").insert([
            {
              id_trabalho: idNovoTrabalho,
              url: item
            },
          ]);
        });

        return res.json(["sucesso", "Novo trabalho adicionado com sucesso"])
      }
      return res.json(["erro", "baralho já está cadastrado"])
    }catch(err){
        res.json(["erro", "Ocorreu um erro ao cadastrar o novo trabalho"])
    }
})

server.post("/addFotoProfissional", (req: Request, res: Response) => {

  uploadImg.single("imgProf")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.json(["erro", "ocorreu um erro no multer"])
      return
    } else if (err) {
      // An unknown error occurred when uploading.
      res.json(["erro", "ocorreu um erro inesperado no upload"])
      return
    }

    // Everything went fine.
    if(req.file?.filename){
      await db("profissionais").insert({foto: req.file.filename})
    }else{
      res.json(["erro", "ocorreu um erro no upload: não conseguiu achar req.file.filename"])
      return
    }

    //req.files[0].filename
    const arrId = await db("profissionais").max("id as id")
    console.log(arrId)
    res.json(["sucesso", arrId])
  })
})

server.post("/addInfosProfissional", async (req: Request, res: Response) => {
  const {nomeProf, emailProf, descricaoMenor, descricaoMaior, id, valorMin} = req.body

  try{
    await db("profissionais").update({nome: nomeProf, email: emailProf, descricaoMenor, descricaoMaior, valorMin}).where({id})

    /*for(let i = 0; i < arrTrabalho.length; i++){
      let trabalhoAtual = arrTrabalho[i]
      const arrIdTrabalhoAtual = await db("trabalhos").select("id").where({trabalho: trabalhoAtual})
      const idTrabalhoAtual = arrIdTrabalhoAtual[0].id
      await db("reltrabprof").insert({id_trabalho: idTrabalhoAtual, id_profissional: id})
    }*/

    
    bcrypt.genSalt(10, function(err, salt) {
      let senhaAuto = emailProf + "@123"
      bcrypt.hash(senhaAuto, salt, async function(err, hash) {
          if(err){
              res.json(["erro", "não foi possível cadastrar a senha"])
              return
          }else{
              //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
              await db('loginatendentes').insert({email: emailProf, hash, id_profissional: id}) //A unica coisa que mudei foi a ordem desses doissssssssss
          }
      });
  });



    res.json(["sucesso", "dados inseridos com sucesso"])
  }catch(err){
      res.json(["erro", "erro ao inserir algum dado no banco de dados"])
  }


})


server.get("/pegarInfoProfissionais", async (req: Request, res: Response) => {
    try{
      const arrInfoPros = await db("profissionais").select()
      console.log(arrInfoPros)
      /*
      for(let i = 0; i < arrInfoPros.length; i++){
        const item = arrInfoPros[i]
        item.desc = []
        console.log(item.id)
        const arrIdBaralhos = await db("reltrabprof").select("id_trabalho").where({id_profissional: item.id})
        console.log(arrIdBaralhos)
        const arrBaralho = []
        for(let j = 0; j < arrIdBaralhos.length; j++){
          const idBaralhoAtual = arrIdBaralhos[j].id_trabalho
          const arrObjBaralho = await db("trabalhos").select("trabalho").where({id: idBaralhoAtual})
          arrBaralho.push(arrObjBaralho[0].trabalho)
        }

        item.desc = arrBaralho

      }*/


      for(let i = 0; i < arrInfoPros.length; i++){
        const item = arrInfoPros[i]
        const arrTotalArrecadado = await db("historicossalvos").sum("precoReal").where({id_profissional: item.id})
        if(arrTotalArrecadado.length > 0){
          item.totalArrecadado = arrTotalArrecadado[0]["sum(`precoReal`)"]
        }else{
          item.totalArrecadado = 0
        }
      }

      res.json(["sucesso", arrInfoPros])
    }catch(err){
      res.json(["erro", "ocorreu um erro ao pegar as informações dos profissinais. Por favor, recarregue a página"])
    }
})


server.get("/detalhesProfissional")


server.post("/irPerfil", async (req: Request, res: Response) => {
  const {id} = req.body

  try{
    const arrPerfil = await db("profissionais").select().where({id})
    const arrTotalArrecadado = await db("historicossalvos").sum("precoReal").where({id_profissional: id})
    if(arrTotalArrecadado.length > 0){
     arrPerfil[0].totalArrecadado = arrTotalArrecadado[0]["sum(`precoReal`)"]
    }else{
     arrPerfil[0].totalArrecadado = 0
    }
    return res.json(["sucesso", arrPerfil[0]])
  }catch(err){
    return res.json(["erro", "ocorreu algum erro ao pegar as informações do profissional solicitado, por favor, tente novamente."])
  }


})


server.post("/login", async (req: Request, res: Response) => {

  type ReturnJsonType = ["erro", string?] | {token: string }[]

  const {email, senha, tipoLogin} = req.body

  if(!tipoLogin){
    return res.json(["erro", "não foi enviado o tipo do login por parte do front-end, por favor tente novamente. Caso persista contatar o suporte"])
  }

  try{

    let secret = ""
    let loginBd = ""
    let tipoIdAtual = ""

    switch(tipoLogin){
      case "atendente":
        loginBd = "loginatendentes"
        tipoIdAtual = "id_profissional"
        if(process.env.SECRET_ATENDENTE){
          secret = process.env.SECRET_ATENDENTE 
        }else{
          return res.json(["erro", "problema ao encontrar o secret no servidor"])
        }
        break

      case "usuario":
        loginBd = "loginusuario"
        tipoIdAtual = "id_usuario"
        if(process.env.SECRET_USUARIO){
          secret = process.env.SECRET_USUARIO 
        }else{
          return res.json(["erro", "problema ao encontrar o secret no servidor"])
        }
        break

      case "admGeral":
        loginBd = "loginadmgeral"
        tipoIdAtual = "id_admGeral"
        if(process.env.SECRET_ADM_GERAL){
          secret = process.env.SECRET_ADM_GERAL 
        }else{
          console.log("ta vindoaquiiiii")
          return res.json(["erro", "problema ao encontrar o secret no servidor"])
        }
    }

      let arrUser = await db(loginBd).where({email}).select()

      if(arrUser.length == 0){
          res.status(401).json(["erro", "email errado"] as ReturnJsonType)
          return
      }

      bcrypt.compare(senha, arrUser[0].hash, async function(err, resp) {
          if(resp){
              try{
                  if(!secret){
                      res.json(["erro", "Jwt secret não encontrado no servidor"] as ReturnJsonType)
                  }else{
                      const token = jwt.sign({
                          id: arrUser[0][tipoIdAtual],
                          email: arrUser[0].email
                      }, secret, {expiresIn: "24h"})
                      if(token){
                          res.json(["sucesso", {token}] as ReturnJsonType) 
                      }else{
                          res.json(["erro", "problema na criação do token"] as ReturnJsonType)
                      }
                  }
              }catch(err){
                  res.json(["erro"] as ReturnJsonType)
              }
          }else{
              res.status(401).json(["erro", "senha errada"] as ReturnJsonType)
          }
      });
  }catch{
      res.status(400).json(["erro", "Ocorreu um erro ao inserir dados no banco de dados, por favor, tente novamente"] as ReturnJsonType)
  }

})


server.post("/redefinirSenhaAdmGeral", confereTokenAdmGeral, async (req: Request, res: Response) => {
  const {senhaNova, senhaAntiga} = req.body

  const tokenDecod = tokenAdmGeralDecodificado(req, res)

  console.log("tokendecod")
  console.log(tokenDecod)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do administrador. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrHash = await db("loginadmgeral").select("hash").where({id_admGeral: tokenDecod.id})

    if(arrHash.length > 0){
      bcrypt.compare(senhaAntiga, arrHash[0].hash, async function(err, resp) {
        if(resp){
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(senhaNova, salt, async function(err, hash) {
                if(err){
                  return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Problemas no bcrypt"])
                }else{
                    //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
                    await db('loginadmgeral').update({hash}).where({id_admGeral: tokenDecod.id}) //A unica coisa que mudei foi a ordem desses doissssssssss
                    return res.json(["sucesso", "Nova senha definida com sucesso!"])
                }
            });
          });
        }else{
            return res.status(401).json(["erro", "senha Antiga errada"])
        }
      });
    }else{
      return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Possível problema com o token. Caso persista é recomendado que seja feito o login novammente"])
    }


  }catch(err){
    return res.status(401).json(["erro", "Não foi possível redefinir a senha. Por favor tente novamente"])
  }

})

server.post("/redefinirSenhaAtendente", confereTokenAtendente, async (req: Request, res: Response) => {
  const {senhaNova, senhaAntiga} = req.body

  const tokenDecod = tokenAtendenteDecodificado(req, res)


  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do administrador. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrHash = await db("loginatendentes").select("hash").where({id_profissional: tokenDecod.id})

    if(arrHash.length > 0){
      bcrypt.compare(senhaAntiga, arrHash[0].hash, async function(err, resp) {
        if(resp){
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(senhaNova, salt, async function(err, hash) {
                if(err){
                  return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Problemas no bcrypt"])
                }else{
                    //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
                    await db('loginatendentes').update({hash}).where({id_profissional: tokenDecod.id}) //A unica coisa que mudei foi a ordem desses doissssssssss
                    return res.json(["sucesso", "Nova senha definida com sucesso!"])
                }
            });
          });
        }else{
            return res.status(401).json(["erro", "senha Antiga errada"])
        }
      });
    }else{
      return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Possível problema com o token. Caso persista é recomendado que seja feito o login novammente"])
    }


  }catch(err){
    return res.status(401).json(["erro", "Não foi possível redefinir a senha. Por favor tente novamente"])
  }
})

server.post("/redefinirSenhaUsuario", confereTokenUsuario, async (req: Request, res: Response) => {
  const {senhaNova, senhaAntiga} = req.body

  const tokenDecod = tokenUsuarioDecodificado(req, res)


  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do administrador. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrHash = await db("loginusuario").select("hash").where({id_usuario: tokenDecod.id})

    if(arrHash.length > 0){
      bcrypt.compare(senhaAntiga, arrHash[0].hash, async function(err, resp) {
        if(resp){
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(senhaNova, salt, async function(err, hash) {
                if(err){
                  return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Problemas no bcrypt"])
                }else{
                    //usuarios tem o email como primary key e os outros como foreign, logo tem q criar em usuarios primeiro pra dps poder criar nos outros
                    await db('loginusuario').update({hash}).where({id_usuario: tokenDecod.id}) //A unica coisa que mudei foi a ordem desses doissssssssss
                    return res.json(["sucesso", "Nova senha definida com sucesso!"])
                }
            });
          });
        }else{
            return res.status(401).json(["erro", "senha Antiga errada"])
        }
      });
    }else{
      return res.json(["erro", "não foi possível cadastrar a nova senha, por favor, tente novamente. Possível problema com o token. Caso persista é recomendado que seja feito o login novammente"])
    }


  }catch(err){
    return res.status(401).json(["erro", "Não foi possível redefinir a senha. Por favor tente novamente"])
  }
})


server.get("/SetarOffline", confereTokenAtendente, async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  if(tokenDecod.id == 0){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  try{
    await db("profissionais").update({status: "offline"}).where({id: tokenDecod.id})
    io.sockets.emit("mudStatus", {status: "offline", id: tokenDecod.id})
    res.json(["sucesso", "status: offline"])
  }catch(err){
    return res.json(["erro", "erro ao setar status do atendente. Por favor, tente novamente"])
  }

})


server.get("/pegarInfoUsuario", confereTokenUsuario, async (req: Request, res: Response) => {



    const tokenDecod = tokenUsuarioDecodificado(req, res)



    try{
      const arrInfoUsuario = await db("usuarios").select().where({id: tokenDecod.id})
      console.log(arrInfoUsuario[0])
      return res.json(["sucesso", arrInfoUsuario[0]])
    }catch(err){
      return res.json(["erro", "ocorreu algum erro ao pegar valores do banco de dados"])
    }


})

server.post("/pegarInfoCliente", confereTokenAtendente, async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)
  const {idCliente} = req.body

  try{
    let arrInfoCliente = await db("usuarios").select("nome", "email", "saldo", "dataNas").where({id: Number(idCliente)})
    for(let i = 0; i < arrInfoCliente.length; i++){
      const arrPrecoTempo = await db("salas").select("precoConsulta", "tempoConsulta").where({id_cliente: idCliente, id_profissional: tokenDecod.id})
      if(arrPrecoTempo){
        if(arrPrecoTempo[0]){
          arrInfoCliente[i].tempoConsulta = arrPrecoTempo[0].tempoConsulta
          arrInfoCliente[i].precoConsulta = arrPrecoTempo[0].precoConsulta
        }else{
          arrInfoCliente[i].tempoConsulta = 0
          arrInfoCliente[i].precoConsulta = 0
        }
      }else{
        arrInfoCliente[i].tempoConsulta = 0
        arrInfoCliente[i].precoConsulta = 0
      }

    }
    console.log("conseguiu pegar arrInfo")
    return res.json(["sucesso", arrInfoCliente[0]])
  }catch(err){
    console.log("NAAAAO conseguiu pegar arrInfo")
    return res.json(["erro", {nome: "Usuário", email: ""}])
  }
})

server.post("/infoIdAtendente", async (req: Request, res: Response) => {
  const {id} = req.body

  if(id){
    try{
      const arrInfosAtendente = await db("profissionais").select().where({id})
      if(arrInfosAtendente.length > 0){
        const arrTotalArrecadado = await db("historicossalvos").sum("precoReal").where({id_profissional: id})
        if(arrTotalArrecadado.length > 0){
         arrInfosAtendente[0].totalArrecadado = arrTotalArrecadado[0]["sum(`precoReal`)"]
        }else{
         arrInfosAtendente[0].totalArrecadado = 0
        }
        return res.json(["sucesso", arrInfosAtendente[0]])
      }else{
        return res.json(["erro", "ocorreu um erro ao pegar informações do atendente. Por favor, tente novamente."])
      }
    }catch(err){
      return res.json(["erro", "ocorreu um erro ao pegar informações do atendente. Por favor, tente novamente."])
    }
  }else{
    return res.json(["erro", "ocorreu um erro ao pegar informações do atendente. Por favor, tente novamente."])
  }

})

server.get("/minhasInfosAtendente", confereTokenAtendente, async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do atendente. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrInfosAtendente = await db("profissionais").select().where({id: tokenDecod.id})
    const arrTotalArrecadado = await db("historicossalvos").sum("precoReal").where({id_profissional: tokenDecod.id})
    if(arrTotalArrecadado.length > 0){
      arrInfosAtendente[0].totalArrecadado = arrTotalArrecadado[0]["sum(`precoReal`)"]
    }else{
      arrInfosAtendente[0].totalArrecadado = 0
    }

    return res.json(["sucesso", arrInfosAtendente[0]])
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao pegar os valores do banco de dados"])
  }

})

server.get("/meusHistoricosAtendente", confereTokenAtendente, async (req: Request, res: Response) => {

  const tokenDecod = tokenAtendenteDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do atendente. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrHistoricosAtendente = await db("historicossalvos").select("historico", "id_cliente", "data").where({id_profissional: tokenDecod.id})
    
    for(let i = 0; i < arrHistoricosAtendente.length; i++){
      const item = arrHistoricosAtendente[i]
      const arrNomeCliente = await db("usuarios").select("nome").where({id: item.id_cliente})
      item.nomeCliente = arrNomeCliente[0].nome
      console.log(typeof item.data)
      item.data = item.data
    }

    return res.json(["sucesso", arrHistoricosAtendente])
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao pegar o histórico. Por favor, tente novamente"])
  }
})

server.post("/setarStatus", confereTokenAtendente, async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do atendente. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  const {status} = req.body

  try{
    await db("profissionais").update({status}).where({id: tokenDecod.id})
    return res.json(["status atualizado"])
  }catch(err){
    return res.json(["erro"])
  }

})

server.get("/infoAtendente", async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  const arrNome = await db("profissionais").select("nome").where({id: tokenDecod.id})
  console.log(arrNome)
  if(!arrNome || (arrNome.length == 0)){
    return res.json(["erro", "ocorreu um erro ao buscar dados no banco de dados, por favor, tente novamente"])
  }

  const arrIdsBaralhosBruto = await db("trabalhos").select("id")
  if(!arrIdsBaralhosBruto || !(arrIdsBaralhosBruto[0].id)){
    return res.json(["erro", "ocorreu um erro ao buscar dados no banco de dados, por favor, tente novamente"])
  }

  let arrBaralhos = []

  for(let i = 0; i < arrIdsBaralhosBruto.length; i++){
    const idAtual = arrIdsBaralhosBruto[i].id

    const arrNome = await db("trabalhos").select("trabalho").where({id: idAtual})
    if(!arrNome || !(arrNome[0].trabalho)){
      return res.json(["erro", "ocorreu um erro ao buscar dados no banco de dados, por favor, tente novamente"])
    }
    const nome = arrNome[0].trabalho

    const arrUrlsBruto = await db("urlstrabalhos").select("url").where({id_trabalho: idAtual})
    if(!arrUrlsBruto || !(arrUrlsBruto[0].url)){
      return res.json(["erro", "ocorreu um erro ao buscar dados no banco de dados, por favor, tente novamente"])
    }

    let arrUrls = []

    for(let i = 0; i < arrUrlsBruto.length; i++){
      const url = arrUrlsBruto[i].url
      arrUrls.push(url)
    }

    arrBaralhos.push({nome, urls: arrUrls})
  }  

  console.log(arrBaralhos)



  res.json(["sucesso", {idAtendente: tokenDecod.id, baralhos: arrBaralhos}])
})


server.get("/infoMeuAtendente", confereTokenUsuario, async (req: Request, res: Response) => {
  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(tokenDecod.id == 0){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  try{
    const arrIdMeuProfissional = await db("salas").select("id_profissional").where({id_cliente: tokenDecod.id}) 
    if(arrIdMeuProfissional.length > 0){
      const arrInfosMeuAtendente = await db("profissionais").select().where({id: arrIdMeuProfissional[0].id_profissional})
      if(arrInfosMeuAtendente.length > 0){
        arrInfosMeuAtendente[0].totalArrecadado = 0
        return res.json(["sucesso", arrInfosMeuAtendente[0]])
      }else{
        return res.json(["erro", "ocorreu algum erro, por favor, tentar novamente"])
      }
    }else{
      return res.json(["erro", "ocorreu algum erro, por favor, tentar novamente"])
    }
  }catch(err){
    return res.json(["erro", "ocorreu algum erro, por favor, tentar novamente"])
  }

})


server.post("/detalheProfissional", async (req: Request, res: Response) => {
  const {idProfissional} = req.body

  console.log(idProfissional)

  try{
    const arrDetalhes = await db("historicossalvos").select("id_cliente", "precoReal", "inicioConsulta", "finalReal", "id").where({id_profissional: idProfissional})

    if(arrDetalhes.length == 0){
      return res.json(["sem dados"])
    }
    
    const arrDetalhesFinal = []
  
    for(let i = 0; i < arrDetalhes.length; i++){
      const item = arrDetalhes[i]
  
      let arrNome = [{nome: "Usuário"}]
  
      if(item.id_cliente){
        arrNome = await db("usuarios").select("nome").where({id: item.id_cliente})
      }
  
      arrDetalhesFinal.push({nomeCliente: arrNome[0].nome, precoConsulta: item.precoReal, inicio: item.inicioConsulta, fim: item.finalReal, idHistorico: item.id})
  
    }

    return res.json(["sucesso", arrDetalhesFinal])
  }catch(err){
    console.log(err)
    return res.json(["erro", "não foi possível pegar as informações do profissional"])

  }

})



server.post("/pegarHistorico", async (req: Request, res: Response) => {
  const {idHistorico} =  req.body

  if(idHistorico){
    const arrHistorico = await db("historicossalvos").select("historico").where({id: idHistorico})
    if(arrHistorico.length > 0){
      res.json(["sucesso", arrHistorico[0].historico])
    }
  }else{
    res.json(["erro"])
  }
})



server.post("/encerrarAtendimento", confereTokenAtendente, async (req:  Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  const {idCliente} = req.body

  if(tokenDecod.id == 0 || !tokenDecod){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  try{
    const arrIdSala = await db("salas").select("idSala").where({id_profissional: tokenDecod.id})
    if(arrIdSala.length > 0){
      const arrHistorico = await db("salas").select("historico", "precoConsulta", "inicioConsulta", "finalConsulta").where({idSala: arrIdSala[0].idSala})
      const diaConsulta = new Date()
      if(arrHistorico[0].historico){
        await db("historicossalvos").insert({historico: arrHistorico[0].historico, id_cliente: idCliente, id_profissional: tokenDecod.id, data: diaConsulta, precoConsulta: arrHistorico[0].precoConsulta, inicioConsulta: arrHistorico[0].inicioConsulta, finalConsulta: arrHistorico[0].finalConsulta})
        const arrFinalReal = await db("historicossalvos").select("finalReal").where({historico: arrHistorico[0].historico, id_cliente: idCliente, id_profissional: tokenDecod.id})
        if(arrFinalReal.length > 0){
          const finalReal = arrFinalReal[0].finalReal
          const difTempo =  Math.abs(arrHistorico[0].finalConsulta.getTime() - finalReal.getTime())/60000
          if(difTempo > 0){
            //preco final não é o previsto e precisa ser calculado
            console.log("PRECO FINAL NÃAAAO É O PREVISTO, ACABOU ANTESSSSS")
            const duracaoReal = Math.abs(finalReal.getTime() - arrHistorico[0].inicioConsulta)/60000
            const difTempoMin = duracaoReal.toFixed(2).toString().split(".")
            const minutosConsulta = Number(difTempoMin[0])
            const segundosConsulta = Number(difTempoMin[1])*60/100
            const arrValorMin = await db("profissionais").select("valorMin").where({id: tokenDecod.id})
            if(arrValorMin.length > 0){
              if(segundosConsulta > 0){
                const minutosFinal = minutosConsulta + 1
                const valorTotal = minutosFinal * arrValorMin[0].valorMin
                await db("historicossalvos").update({precoReal: valorTotal}).where({historico: arrHistorico[0].historico, id_cliente: idCliente, id_profissional: tokenDecod.id})
                const arrSaldo = await db("usuarios").select("saldo").where({id: idCliente})
                if(arrSaldo.length > 0){
                  await db("usuarios").update({saldo: arrSaldo[0].saldo - valorTotal, previsaoSaldo: arrSaldo[0].saldo - valorTotal}).where({id: idCliente})
                }

              }else{
                const valorTotal = minutosConsulta * arrValorMin[0].valorMin
                await db("historicossalvos").update({precoReal: valorTotal}).where({historico: arrHistorico[0].historico, id_cliente: idCliente, id_profissional: tokenDecod.id})
                const arrSaldo = await db("usuarios").select("saldo").where({id: idCliente})
                if(arrSaldo.length > 0){
                  await db("usuarios").update({saldo: arrSaldo[0].saldo - valorTotal, previsaoSaldo: arrSaldo[0].saldo - valorTotal}).where({id: idCliente})
                }
              }
            }
            
          }else{
            //preco final é o preco previsto
            console.log("O PRECO FINAL É O PREVISTO ACABOU NA HORA OU DEPOISSSS")
            await db("historicossalvos").update({precoReal: arrHistorico[0].precoConsulta}).where({historico: arrHistorico[0].historico, id_cliente: idCliente, id_profissional: tokenDecod.id})
            const arrSaldo = await db("usuarios").select("saldo").where({id: idCliente})
            if(arrSaldo.length > 0){
              await db("usuarios").update({saldo: arrSaldo[0].saldo - arrHistorico[0].precoConsulta, previsaoSaldo: arrSaldo[0].saldo - arrHistorico[0].precoConsulta}).where({id: idCliente})
            }
          }

        }
      }
      await db("salas").where({id_profissional: tokenDecod.id}).del()
      console.log("ANTES SOCKET ENCERRAR SALA")
      io.sockets.to(arrIdSala[0].idSala.toString()).emit("salaEncerrada", {msg: "A seção do chat foi encerrada. Agradecemos pela sua preferência!", idSala: arrIdSala[0].idSala.toString()})
      console.log("DEPOIS SOCKET ENCERRAR SALA")
      io.in(arrIdSala[0].id).socketsLeave(arrIdSala[0].idSala)
      io.sockets.emit("mudStatus", {status: "online", id: tokenDecod.id})
      return res.json(["sucesso", "atendimento finalizado com sucesso"])
    }else{
      return res.json(["sucesso", "não existem salas abertas para serem encerradas"])
    }
  }catch(err){
    res.json(["erro", "ocorreu um erro ao finalizar o atendimento"])
  }
})


server.post("/mudarSaldo", confereTokenUsuario, async (req: Request, res: Response) => {
  const {previsaoSaldo} = req.body

  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    await db("usuarios").update({previsaoSaldo}).where({id: tokenDecod.id})
    return res.json(["sucesso", "previsão saldo atualizada com sucesso"])
  }catch(err){
    return res.json(["erro", "erro ao inserir dados ao banco de dados, por favor, tente novamente."])
  }
})

server.get("/pegarPrevSaldo", confereTokenUsuario, async (req: Request, res: Response) => {
  
  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrPrevSaldo = await db("usuarios").select("previsaoSaldo").where({id: tokenDecod.id})
    if(arrPrevSaldo.length > 0){
      if(arrPrevSaldo[0].previsaoSaldo){
        return res.json(["sucesso", arrPrevSaldo[0]])
      }else{
        return res.json(["erro", "ocorreu algum erro ao pegar a previsao de saldo. Por favor, tente novamente"])
      }
    }else{
      return res.json(["erro", "ocorreu algum erro ao pegar a previsao de saldo. Por favor, tente novamente"])
    }
  }catch(err){
    return res.json(["erro", "ocorreu algum erro ao pegar a previsao de saldo. Por favor, tente novamente"])
  }
})


server.get("/quantoFaltaCliente", async (req: Request, res: Response) => {
  const tokenDecod = tokenUsuarioDecodificado(req, res)

  try{
    const arrHr: [{finalConsulta: Date}] | any[] = await db("salas").select("finalConsulta").where({id_cliente: tokenDecod.id})
    const time = new Date()
    console.log(time)
    console.log("Faltam: " + Math.abs(arrHr[0].finalConsulta.getTime() - time.getTime()))
    const tempoBruto = Math.abs(arrHr[0].finalConsulta.getTime() - time.getTime())/60000
    const arrTempos = tempoBruto.toFixed(2).toString().split(".")
    const minutosRestantes = Number(arrTempos[0])
    const segundosRestantes = Number(arrTempos[1])*60/100
    res.json(["sucesso", {minutosRestantes, segundosRestantes}])
  }catch(err){
    res.json(["erro", "ocorreu um erro. Por favor, tente novamente"])
  }

})

server.get("/quantoFaltaAtendente", async (req: Request, res: Response) => {
  const tokenDecod = tokenAtendenteDecodificado(req, res)

  try{
    const arrHr: [{finalConsulta: Date}] | any[] = await db("salas").select("finalConsulta").where({id_profissional: tokenDecod.id})
    if(arrHr.length > 0){
        const time = new Date()
      console.log(time)
      console.log("Faltam: " + Math.abs(arrHr[0].finalConsulta.getTime() - time.getTime()))
      const tempoBruto = Math.abs(arrHr[0].finalConsulta.getTime() - time.getTime())/60000
      const arrTempos = tempoBruto.toFixed(2).toString().split(".")
      const minutosRestantes = Number(arrTempos[0])
      const segundosRestantes = Number(arrTempos[1])*60/100
      console.log(minutosRestantes)
      console.log(segundosRestantes)
      return res.json(["sucesso", {minutosRestantes, segundosRestantes}])
    }

    return ["sem sala", "Você não tem nenhuma sala aberto no momento"]


  }catch(err){
    return res.json(["erro", "ocorreu um erro. Por favor, tente novamente"])
  }

})


/* ROTAS WEBSOCKETS */

server.post("/criarSala", async (req: Request, res: Response) => { 

  const {idCliente, idProfissional, precoConsultaVar, tempoConsultaVar} = req.body

  try{

    await db("salas").insert({id_cliente: idCliente, id_profissional: idProfissional, historico: "", precoConsulta: precoConsultaVar, tempoConsulta: tempoConsultaVar})
    const arrTempoAtual = await db("salas").select("inicioConsulta").where({id_cliente: idCliente, id_profissional: idProfissional})
    await db("salas").update({finalConsulta: db.raw('date_add(?, INTERVAL ? minute)', [arrTempoAtual[0].inicioConsulta, tempoConsultaVar])}).where({id_cliente: idCliente}).andWhere({aberta: true});

    const arrIdSala = await db("salas").select("idSala").where({id_cliente: idCliente}).andWhere({aberta: true})
    io.sockets.emit("novaSala", {newRoom: arrIdSala[0].idSala, createdById: idCliente, idProfissional}) //É um problema enviar esse nova sala para todos os sockets
    await db("profissionais").update({status: "ocupado"}).where({id: idProfissional})
    console.log("ta acionando o emi mudStatus")
    io.sockets.emit("mudStatus", {status: "ocupado", id: idProfissional.toString()})
    console.log("ja acionouuu")
    res.json(["sucesso", arrIdSala[0]])
  }catch(err){
    res.json(["erro", "ocorreu um erro ao inserir um dado ao banco de dados"])
  }

})


server.post("/atualizarTempoConsulta", confereTokenUsuario, async (req: Request, res: Response) => {
  const {precoAdd, tempoAdd} = req.body

  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  if(precoAdd && tempoAdd){
    //usar preco add pra somar no precoConsulta da tablea salas, mas tambem para reduzir o valor da prevSaldo na tabela usuarios
    try{
      const arrPrevSaldoAntigo = await db("usuarios").select("previsaoSaldo").where({id: tokenDecod.id})
      if(arrPrevSaldoAntigo.length > 0){
        await db("usuarios").update({previsaoSaldo: arrPrevSaldoAntigo[0].previsaoSaldo - precoAdd})
        const arrConsultaAntigo = await db("salas").select("precoConsulta", "tempoConsulta", "finalConsulta").where({id_cliente: tokenDecod.id}) //Como cada cliente só pode entrar em uma sala por vez, o id cliente tbm serve como identificador único
        if(arrConsultaAntigo.length > 0){
          await db("salas").update({precoConsulta: arrConsultaAntigo[0].precoConsulta + precoAdd, tempoConsulta: arrConsultaAntigo[0].tempoConsulta + tempoAdd, finalConsulta: db.raw('date_add(?, INTERVAL ? minute)', [arrConsultaAntigo[0].finalConsulta, tempoAdd])}).where({id_cliente: tokenDecod.id})
          return res.json(["sucesso", "dados atualizados com sucesso"])
        }else{
          return res.json(["erro", "não conseguimos completar as transações no banco de dados. Por favor, tente novamente"])
        }
      }else{
        return res.json(["erro", "não conseguimos completar as transações no banco de dados. Por favor, tente novamente"])
      }
    }catch(err){
      return res.json(["erro", "não conseguimos completar as transações no banco de dados. Por favor, tente novamente"])
    }
  }else{
    return res.json(["erro", "não foi possível pegar os valores do corpo da requisição"])
  }

})

server.post("/confereSalas", confereTokenUsuario, async (req: Request, res: Response) => {
  //tem que conferir direto pelo status pq o cara pode ter setado ocupado mesmo estando sem sala pra ir no banheiro por exemplo

  const tokenDecod = tokenUsuarioDecodificado(req, res)
  const {idProfissional} = req.body

  if(tokenDecod.id == 0 || !idProfissional){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  try{

    const arrStatusProfissional = await db("profissionais").select("status").where({id: idProfissional})

    if(arrStatusProfissional.length > 0){
      if(arrStatusProfissional[0].status == "online"){
        //tá disponível
        return res.json(["sucesso", "criar sala"])
      }else if(arrStatusProfissional[0].status == "ocupado"){
        const arrSalaCliente = await db("salas").select("idSala").where({id_cliente: tokenDecod.id, id_profissional: idProfissional})
        if(arrSalaCliente.length > 0){
          return res.json(["sucesso", "sala existente", arrSalaCliente[0].idSala])
        }else{
          return res.json(["sucesso", "profissional ocupado"])
        }
      }else{
        return res.json(["sucesso", "profissional não disponível"])
      }
    }else{
      return res.json(["erro", "ocorreu um erro ao pegar o status do atendente."])
    }

  }catch(err){
      return res.json(["erro", "ocorreu um erro ao conferir dados no banco de dados. Por favor, tente novamente"])
  }
})

server.get("/buscarSalaUsuario", confereTokenUsuario, async (req: Request, res: Response) => {
  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(tokenDecod.id == 0){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  try{
    if(tokenDecod.id){
      const arrIdSalaAtual = await db("salas").select("idSala", "tempoConsulta", "precoConsulta").where({id_cliente: tokenDecod.id})
      return res.json(["sucesso", arrIdSalaAtual[0]])
    }else{
      return res.json(["erro", "ocorreu algum erro. Por favor, tente novamente"])
    }

  }catch(err){
    return res.json(["erro", "ocorreu algum erro. Por favor, tente novamente"])
  }
})


server.get("/buscarSalasAtendente", confereTokenAtendente, async (req: Request, res: Response) => {


  const tokenDecod = tokenAtendenteDecodificado(req, res)


  if(tokenDecod.id == 0){
    return res.json(["erro", "ocorreu algum erro ao verificar o token"])
  }

  let arrConversas = []

  try{
    arrConversas = await db("salas").select("idSala", "id_cliente", "tempoConsulta", "precoConsulta").where({id_profissional: tokenDecod.id}).andWhere({aberta: true})
    console.log("id q chegou do profissional é: " + tokenDecod.id)
    if(arrConversas.length > 0){
      for(let i = 0; i < arrConversas.length; i++){
        const idClienteAtual = arrConversas[i].id_cliente
        const arrNomeAtual = await db("usuarios").select("nome", "saldo", "dataNas").where({id: idClienteAtual})
        const arrPrecoTempoAtual = await db("salas").select("tempoConsulta", "precoConsulta").where({id_cliente: idClienteAtual})
  
        if(arrNomeAtual.length > 0 && arrPrecoTempoAtual.length > 0){
          arrConversas[i].nome = arrNomeAtual[0].nome
          arrConversas[i].dataNas = arrNomeAtual[0].dataNas
          arrConversas[i].precoConsulta = arrPrecoTempoAtual[0].precoConsulta
          arrConversas[i].tempoConsulta = arrPrecoTempoAtual[0].tempoConsulta
          arrConversas[i].saldo = arrNomeAtual[0].saldo
        }else{
          arrConversas[i].nome = "Usuário"
          arrConversas[i].precoConsulta = 0
          arrConversas[i].tempoConsulta = 0
        }
  
      }
    }

    console.log(arrConversas)
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao buscar os dados no banco de dados"])
  }

  return res.json(["sucesso", arrConversas])

})




server.post("/pagamentoPix", confereTokenUsuario, async (req: Request, res: Response) => {

  console.log(req.body.transaction_amount)

  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }


  try{
    const arrPagamentoExistente = await db("pagamentos").select().where({id_cliente: tokenDecod.id, status: "aberto"})
    if(arrPagamentoExistente.length > 0){
      //Já tem um pagamento aberto dele
      const body = { 
        transaction_amount: arrPagamentoExistente[0].valor,
        description: "",
        payment_method_id: req.body.paymentMethodId,
            payer: {
            email: req.body.email,
            identification: {
        type: req.body.identificationType,
        number: req.body.number,
      }}}

      payment.create({ body, requestOptions: { idempotencyKey: arrPagamentoExistente[0].idempotencyKey} }).then(async (result) => {
        console.log(result)
        return res.json(["pagamento aberto", result])
      }).catch((err) => res.json(["erro", "ocorreu um erro no pagamento "]))
    }else{
      //Não tem pagamento em aberto
      const body = { 
        transaction_amount: req.body.transaction_amount,
        description: req.body.description,
        payment_method_id: req.body.paymentMethodId,
            payer: {
            email: req.body.email,
            identification: {
        type: req.body.identificationType,
        number: req.body.number
      }}}
  
      console.log("PAGAMENTO PIIIIIIXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
      console.log(body)
  
      payment.create({ body, requestOptions: { idempotencyKey: req.body.idempotencyKey} }).then(async (result) => {
        console.log(result)
        try{
          const arrNomeUsuario = await db("usuarios").select("nome").where({id: tokenDecod.id})
          await db("pagamentos").insert({id_pagamento: result.id?.toString(), valor: result.transaction_amount, idempotencyKey: req.body.idempotencyKey, nomeUsuario: arrNomeUsuario[0].nome, cpf: req.body.number.toString(), data: new Date(), status: "aberto", id_cliente: tokenDecod.id})
        }catch(err){ 
          return res.json(["erro", "ocorreu um erro ao pegar dados do banco de dados"])
        }
        res.json(["sucesso", result])
      }).catch((err) => res.json(["erro", "ocorreu um erro no pagamento: "+ err]))
    }
  }catch(err){
    return res.json(["erro", "ocorreu um erro ao pegar dados do banco de dados"])
  }


})


server.post("/pagamentoCartao", confereTokenUsuario, async (req: Request, res:Response) => {

  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  payment.create({
    body: { 
        transaction_amount: req.body.transaction_amount,
        token: req.body.token,
        description: "Aumento de saldo Conexão Mística",
        installments: req.body.installments,
        payment_method_id: req.body.payment_method_id,
        issuer_id: req.body.issuer_id,
            payer: {
            email: req.body.payer.email,
            identification: {
        type: req.body.payer.identification.type,
        number: req.body.payer.identification.number
    }}},
    requestOptions: { idempotencyKey: uuidv4() },
    
  })
  .then(async (result) => {
    console.log("RESPOSTA CARTAAAAAAO")
    console.log(result)

    let status = ""
    if(result.status == "approved"){
      status = "aprovado"
      //adicionar valor na conta do cliente
      const arrSaldos = await db("usuarios").select("saldo", "previsaoSaldo").where({id: tokenDecod.id})
      await db("usuarios").update({saldo: arrSaldos[0].saldo + result.transaction_amount, previsaoSaldo: arrSaldos[0].previsaoSaldo + result.transaction_amount}).where({id: tokenDecod.id})
    }else if(result.status == "rejected"){
      status = "negado"
    }else{
      status = "sem info"
    }

    let objRespCartao = {}

    if(result.id && tokenDecod.id && status && result.transaction_amount){
      objRespCartao = {id_pagamento: result.id.toString(), id_cliente: tokenDecod.id, status, valor: result.transaction_amount}
    }else{
      objRespCartao = {id_pagamento: "", id_cliente: 0, status: "", valor: 0}
    }

    try{
      await db("pagcartao").insert(objRespCartao)
      res.json(["sucesso", objRespCartao])
    }catch(err){
      console.log("PROBLEMA NO BANCOOOOOOOO")
      console.log(err)
      res.json(["erro", "houve um problema na conexão com nosso banco de dados. Caso o valor tenha sido cobrado, apresente o comprovante para o seguinte número +55 11 91636-7979"])
    }
    


  })
  .catch((error) => console.log(error));


})


server.post("/notifPag", (req: Request, res: Response) => {
  console.log("HEADER")
  console.log(req.header)
  console.log("BODY")
  console.log(req.body)
})


server.get("/statusPagamento", confereTokenUsuario, async (req: Request, res: Response) => {
  const tokenDecod = tokenUsuarioDecodificado(req, res)

  if(!tokenDecod.id){
    return res.json(["erro", "erro ao decodificar o token do usuário. Por favor tente novamente. Caso persista é recomendado que faça login novamente."])
  }

  try{
    const arrInfosPagamentos = await db("pagamentos").select().where({id_cliente: tokenDecod.id, status: "aberto"})
    console.log("ARRINFOS PAGAMENTOOOOOSOSSSS")
    console.log(arrInfosPagamentos)
    if(arrInfosPagamentos.length > 0){
      const item = arrInfosPagamentos[0]

      const body = { 
        transaction_amount: item.valor,
        description: "",
        payment_method_id: "pix",
            payer: {
            email: "rafatavdev@gmail.com",
            identification: {
        type: "cpf",
        number: "17162148743"
      }}}


      payment.create({ body, requestOptions: { idempotencyKey: item.idempotencyKey} }).then(async (result) => {
        console.log(result)
        if(result.status_detail == "accredited"){
          await db("pagamentos").update({status: "pago"}).where({id_cliente: tokenDecod.id, id_pagamento: result.id})
          const arrSaldos = await db("usuarios").select("saldo", "previsaoSaldo").where({id: tokenDecod.id})
          await db("usuarios").update({saldo: arrSaldos[0].saldo + result.transaction_amount, previsaoSaldo: arrSaldos[0].previsaoSaldo + result.transaction_amount}).where({id: tokenDecod.id})
          return res.json(["pago"])
        }else{
          return res.json(["pagamento em aberto"])
        }
      }).catch((err) => res.json(["erro",  err]))


    }else{
      res.json(["sem pagamentos"])
    }
  }catch(err){
    res.json(["erro", "ocorreu um erro ao pegar valores do pagamento existente"])
  }


})


server.post("/testeCartao", (req: Request, res: Response) => {
  console.log(req.body)
})

/* 
backurls: 
{
  success? http://167.88.32.149/pagarCartao/:idCliente
}
*/

httpServer.listen(8080)