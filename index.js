const puppeteer = require('puppeteer');
const prompt = require("prompt-sync")({sigint: true});

const userInstituto = prompt("Digite o instituto ou aperte ENTER para Biologia:");
const instituto = userInstituto == "" ? "INSTITUTO DE CIÊNCIAS BIOLÓGICAS - BRASÍLIA" : userInstituto;

const titulo = prompt("Digite o código ou disciplina: ");
const turma = prompt("Digite o número da turma: ");

async function sigaa()
{
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://sigaa.unb.br/sigaa/public/turmas/listar.jsf');
    
        // Set screen size
        await page.setViewport({ width: 1080, height: 1024 });
    
        await page.waitForSelector('select[id="formTurma:inputDepto"]');
        let optionValue = await page.evaluate((instituto) => {
            const children = document.querySelectorAll("select[id='formTurma:inputDepto'] option");
            let value = "";
            children.forEach(c=>{
                if(c.innerHTML.toLowerCase().includes(instituto.toLowerCase()))
                    value = c.value;
            });
    
            return value;
        }, instituto);
    
        // console.log(optionValue)
        
        await page.select('select[id="formTurma:inputDepto"]', optionValue);
        // console.log(selectTurma);
    
        // Wait and click on first result
        const searchResultSelector = "[value='Buscar']";
        await page.waitForSelector(searchResultSelector);
        await page.click(searchResultSelector);
    
        // await page.$(".linhaImpar td");
        await page.waitForSelector(".agrupador");
        await page.waitForSelector(".linhaImpar");
        await page.waitForSelector(".linhaPar");
        const turmaEncontrada = await page.evaluate((titulo, turma) => {
            const titulos = document.querySelectorAll(".tituloDisciplina");
            let tituloEncontrado = "";
            let indexDisciplina = -1;
            for(let i = 0; i < titulos.length; i++){
                if(titulos[i].innerHTML.toLowerCase().includes(titulo.toLowerCase())){
                    tituloEncontrado = titulos[i].innerHTML;
                    indexDisciplina = i;
                }
            }
    
            if(indexDisciplina < 0)
                return null;
    
            indexDisciplina++;
    
            const elements = document.querySelectorAll(".listagem tbody tr");
            let indexElements = 0;
            for(let i of elements){
                if(i.classList.contains("agrupador"))
                    indexDisciplina--;
                
                if(indexDisciplina == 0)
                    break;
    
                indexElements++;
            }
    
            indexElements++;
            const turmaEncontrada = {};
            while(!elements[indexElements].classList.contains("agrupador")){
                const infoTurma = elements[indexElements].children;
                if(infoTurma[0].innerHTML.includes(turma)){
                    turmaEncontrada.disciplina = tituloEncontrado;
                    turmaEncontrada.turma = infoTurma[0].innerHTML;
                    turmaEncontrada.professor = infoTurma[2].innerHTML.replaceAll("\t", "").replaceAll("<br>\n", "");
                    turmaEncontrada.horario = infoTurma[3].innerHTML.substring(0, infoTurma[3].innerHTML.indexOf("<")).replaceAll("\t", "");
                    turmaEncontrada.totalVagas = infoTurma[5].innerHTML;
                    turmaEncontrada.vagas = infoTurma[6].innerHTML;
                    turmaEncontrada.local = infoTurma[7].innerHTML;
    
                    return turmaEncontrada;
                }
    
                indexElements++;
            }
    
            return null;
            // return td[22].innerHTML;
        }, titulo, turma);
    
        // let vagas = await page.$$eval(".linhaPar td", element => element.innetHTML);
    
        console.log(turmaEncontrada);
    
        if(turmaEncontrada){
            if(turmaEncontrada.totalVagas > turmaEncontrada.vagas){
                console.log("----------------------");
                console.log("|                      |\n|                      |\n|                      |");
                console.warn("  TEM VAGAAAAAAAAAS!\n       " + (turmaEncontrada.totalVagas - turmaEncontrada.vagas) + ' VAGAS');
                console.log("|                      |\n|                      |\n|                      |");
                console.log("----------------------");
                console.log('\u0007');
            }
            else{
                console.log("=================");
                console.log("\t\tNÃO HÁ VAGAS");
                console.log("=================");
            }
        }
        
    
        // if(vagas != '34')
        // {
        //     console.log('\u0007');
        //     console.log("SURGIU UMA VAGA!!")
        // }
    
        // // Locate the full title with a unique string
        // const textSelector = await page.waitForSelector(
        //   'text/Customize and automate'
        // );
        // const fullTitle = await textSelector.evaluate(el => el.textContent);
    
        // // Print the full title
        // console.log('The title of this blog post is "%s".', fullTitle);        
    } catch (error) {
        console.log("Falhou em conectar...\n", error.message);
    }

    await browser.close();
}

console.log("\n========================\nINICIADO... AGUARDE 10 SEGUNDOS\n\n\n");
setInterval(sigaa, 10000);