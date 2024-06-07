// fim var globais 

window.onchange = setTimeout(function() {
    // ConnectionAndOnMessage();
    var currentPath = window.location.pathname; // Apagar quando todo frontend do painel for em mesma pag, sem mudança de URL

    if(currentPath === "/painel/produtos"){LoadProducts();}
}, 500); 

function WaitAMoment() {
    document.getElementById('wait_a_moment').classList.add("init-wait"); // escurece a tela 
    document.getElementById('spinner').classList.add("spinner"); // chama animation spiner temporizador
    var progress_products = document.getElementById('progress_products');
    progress_products.innerHTML = "Iniciado o carregamento de Produtos..";
    progress_products.classList.add("load");
}

function ConnectionAndOnMessage() {

}

function SearchProduct() {
    LoadProducts(); // Verifica se a lista de produtos em localStorage está atualizada(10min)
    let search          = document.getElementById('search'); 
    let keyword         = document.getElementById('keyword');
    let search_area     = document.getElementById('search_area');
    let search_table    = document.getElementById('search_table'); 
    var products        = JSON.parse(localStorage.getItem("Products")); var result=0;
    var tbody_products  = document.getElementById('tbody_products'); tbody_products.innerHTML = "";
    var table_script    = document.getElementById('table_script'); table_script.innerText = "";

    keyword.innerHTML = "Buscando: "+search.value+".."; search = search.value.toLowerCase();
    search_area.classList.add("show");
    search_table.classList.remove("d-none");

    if(search.length > 2) { // min 3 caracteres
    //if(5 > 2) { // min 3 caracteres
        for(var i=0; i < products.length; i++) { // Loop até o final dos produtos
            var text = products[i].name.toLowerCase(); //console.log(value); // td[1] Equivale somente ao titulo do produto
            
                if(text.indexOf(search) >= 0) { // Se o texto(object) contem a busca digitada
                    result++; //console.log(result+".. Resultados") 
                    if(result < 20) {
                        var images = JSON.parse(products[i].image);
                        if(products[i].seasonal_product != null) {
                            var seasonSelect =  "<option value='"+products[i].seasonal_product+"' selected>"+products[i].seasonal_product+"</option>";
                        } else {
                            var seasonSelect = "<option value='empt'></option>";
                        }
                        var tableRow = "<tr class='striped-linke'>"+
                        "<td class='td-photo'><img src='/storage/produtos/"+images.image1+"' height='50' width='50'></td>"+
                        "<td class='td-name'>"  + products[i].name + "</td>"+
                        "<td>" + 
                            "<select id='select_season"+products[i].id+"' onchange='ChooseSeason("+products[i].id+")'>"+
                                seasonSelect+
                                "<option value='Primavera'>Primavera</option>"+
                                "<option value='Verão'>Verão</option>"+
                                "<option value='Outono'>Outono</option>"+
                                "<option value='Inverno'>Inverno</option>"+
                                "<option value='Primavera-verão'>Primavera/Verão</option>"+
                                "<option value='Outono-inverno'>Outono/Inverno</option>"+
                            "</select>"+
                            "<button id='btn_save"+products[i].id+"' class='btn btn-success d-none' onclick='ChooseSeason("+products[i].id+", true)'>Salvar</button>"+
                        "</td>"+    
                        "<td class='td-preco'>" + products[i].preco_venda + "</td>"+
                        "<td class='td-actions'>"+ "."+
                            "<a href='/painel/produtos/"+products[i].id+"/edit'>"+
                                "<i class='fa fa-edit fa-40px' rel='tooltip' title='Editar Produto'></i>"+
                            "</a>"+ 
                        "</td>"+
                        "<td class='td-var'>..</td>"+
                        "</tr>";
                        
                        tbody_products.innerHTML = tbody_products.innerHTML + tableRow;
                        //console.log("result:"+result);
                    }
                    document.getElementById('result_query').innerHTML = "("+result+" resultados)";
                } 

        }
    } else {
        search_table.classList.add("d-none");
        search_area.classList.remove("show");
        keyword.innerHTML = "";
        document.getElementById('result_query').innerHTML = "";
    }  
    console.log("SearchProduct() init..");  
}

function ChooseSeason(id, save) {
    let btn_save_id = "btn_save"+id;
    let btn_save = document.getElementById(btn_save_id);
    btn_save.classList.remove("d-none"); // mostra btn salvar
    btn_save.classList.add("btn-success");
    btn_save.innerHTML = "Salvar"; 

    if(save === true) {
        let select_season = "select_season"+id;
        var season = document.getElementById(select_season).selectedOptions[0].outerText; // pega a opção escolhida no select
        btn_save.innerHTML = "Salvando..";
        var user = localStorage.getItem("user"); user = JSON.parse(user);

        $.ajax({
            url:'/api/products-edit/'+id+'',  
            data: { seasonal_product: season, user_id: user.id, user_name:user.name},
            complete: function (response) {
                btn_save.innerHTML = "Salvo"; btn_save.classList.remove("btn-success");
                LoadProducts(); console.log(response.responseText);
            },
            error: function () {
                alert('Erro: '+error);
            }
        });
        console.log("Estação escolhida: "+season);
    }
}

function LoadProducts() {
    console.log("LoadProducts() init..");
    var progress_products = document.getElementById('progress_products');
    var lastProductUpdate = localStorage.getItem("LastProductUpdate");
    if(lastProductUpdate === null){lastProductUpdate=0;}else{lastProductUpdate = parseInt(lastProductUpdate);}
    var lastUpdate = parseInt(Date.now()); // Pega o tempo atual em milesundos, ex: 876786756756767
    lastUpdate = lastProductUpdate+600000 - lastUpdate // 600000 ms equivale a 10 min
    


    if(lastProductUpdate === 0 || lastUpdate < 0) {
        WaitAMoment();
        let now = Date.now(); // Pega o tempo atual em milesundos, ex: 876786756756767
        
        $.ajax({
            url:'/api/products',  
            complete: function (response) {
                localStorage.setItem("Products", response.responseText);
                localStorage.setItem("LastProductUpdate", now);
                var products_page = JSON.parse(localStorage.getItem("Products"));
                var products = products_page;
                progress_products.innerHTML = "Carregando: "+products.length+" Produtos em localstorage(navegador)..";
            },
            error: function () {
                console.log("Error Ajax LoadProducts()")
            }
        });

    } else {
        lastUpdate = lastUpdate/60000; lastUpdate = lastUpdate.toFixed(0);
        console.log("Produtos em localStorage atualizados. Próxima atualização em "+lastUpdate+" min.");
    }
    setTimeout(function() {
        document.getElementById('wait_a_moment').classList.remove("init-wait"); // desativa escurece a tela 
        document.getElementById('spinner').classList.remove("spinner"); // encerra animation spiner temporizador
    }, 1000)
}