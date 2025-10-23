//wgrywanie expressa
const express=require("express");
const app=express();
const port="4444";

//wgrywanie mongo
const mongo=require("mongodb");
const url="mongodb://127.0.0.1:27017";

//tworzenie klienta
const klient=new mongo.MongoClient(url);

//połączenie 
klient.connect( err =>{
    if(err) console.log("Brak polaczenia z serwerem");
    else console.log("Serwer polaczony");
})


//wybranie bazy 
const db=klient.db('baza_danych');

//wybranie kolekcji 
const nieruchomosci=db.collection('nieruchomosci');

//dodanie silnika do uruchamiania
app.set('view engine','ejs');

const www=__dirname+"\\www";
const images=__dirname+"\\images";

app.use(express.static(www));
app.use(express.static(images));


//WYSWIETLANIE

//ustawienie index.ejs jako strony glownej


app.get("/",  async (req,res)=>{    
    
    let dane=await nieruchomosci.find().toArray();
    let ilosc=await nieruchomosci.find({icon: 'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    //filtrowanie
    
    const{mieszkanie,wynajem,miejscowosc}=req.query;

    const{icon_src,id,cena,powierzchnia,pietro,rodzaj_budynku,miasto,ulica,typ,adres_zdjecia}=req.query;
    let adres;

     if(icon_src==='https://cdn-icons-png.flaticon.com/512/3395/3395509.png')
        adres='https://cdn-icons-png.flaticon.com/512/3756/3756555.png';
         

    if(icon_src==='https://cdn-icons-png.flaticon.com/512/3756/3756555.png')
        adres='https://cdn-icons-png.flaticon.com/512/3395/3395509.png';    
    


        nieruchomosci.updateOne(
            {
                id:              Number(`${id}`),
                cena:            Number(`${cena}`),
                powierzchnia:    Number(`${powierzchnia}`),
                pietro:          Number(`${pietro}`),
                rodzaj_budynku:   `${rodzaj_budynku}`,
                miasto:           `${miasto}`,
                ulica:            `${ulica}`,
                typ:              `${typ}`,
                zdjecie:          `${adres_zdjecia}`,
                icon:             `${icon_src}`
            },
            {$set:
            {
                icon: `${adres}`
            }    
        });


    if ((mieszkanie==='' && wynajem==='' && miejscowosc==='') || (mieszkanie===undefined && wynajem===undefined && miejscowosc===undefined))
    {
        dane=await nieruchomosci.find().toArray();
    }

    else    
    {        
    
    //po 1
    if(mieszkanie!=='' && mieszkanie!==undefined)
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`}).toArray();

    if(wynajem!=='' && wynajem!==undefined)
    dane=await nieruchomosci.find({typ:`${wynajem}`}).toArray();

    if(miejscowosc!=='' && miejscowosc!==undefined)
    dane=await nieruchomosci.find({miasto:`${miejscowosc}`}).toArray();

    //po 2

    if(mieszkanie!=='' && mieszkanie!==undefined && wynajem!=='' && wynajem!==undefined )
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`, typ:`${wynajem}`}).toArray();

    if(mieszkanie!=='' && mieszkanie!==undefined && miejscowosc!=='' && miejscowosc!==undefined )
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`, miasto:`${miejscowosc}`}).toArray();

    if(wynajem!=='' && wynajem!==undefined && miejscowosc!=='' && miejscowosc!==undefined )
    dane=await nieruchomosci.find({typ:`${wynajem}`, miasto:`${miejscowosc}`}).toArray();

    //po 3 
    if(wynajem!=='' && wynajem!==undefined && miejscowosc!=='' && miejscowosc!==undefined && mieszkanie!=='' && mieszkanie!==undefined)
    dane=await nieruchomosci.find({rodzaj_budynku: `${mieszkanie}`, typ:`${wynajem}`, miasto:`${miejscowosc}`}).toArray();

    }

    res.render('index.ejs',{a:dane,b:ilosc});
   
});


//DODAWANIE


//renderowanie strony
app.get("/dodaj", async (req,res)=>{

    let ilosc=await nieruchomosci.find({icon: 'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    res.render('dodaj.ejs',{b:ilosc});
});


//odbieranie danych ze strony 
app.get("/dodawanie", (req,res)=>{

    const{id,cena,powierzchnia,pietro,rodzaj_budynku,miasto,ulica,typ,zdjecie}=req.query;

    if(id!==undefined && cena!==undefined && powierzchnia!==undefined && pietro!==undefined && rodzaj_budynku!==undefined &&
         miasto!==undefined && ulica!==undefined && typ!==undefined && zdjecie!==undefined &&

         id!==0 && cena!==0 && powierzchnia!==0 && pietro!==0 && rodzaj_budynku!=='' &&
         miasto!=='' && ulica!=='' && typ!=='' && zdjecie!=='')
    {
    nieruchomosci.insertOne
    ({
        cena:    Number(`${cena}`),
        powierzchnia:    Number(`${powierzchnia}`),
        pietro:    Number(`${pietro}`),
        rodzaj_budynku:   `${rodzaj_budynku}`,
        zdjecie: `${zdjecie}`,
        miasto: `${miasto}`,
        ulica: `${ulica}`,
        typ: `${typ}`,
        id:    Number(`${id}`),
        icon: 'https://cdn-icons-png.flaticon.com/512/3395/3395509.png'
    });
    res.send(`<h1>Dane zostały wprowadzone <br> <a href='/'>Powrót na stronę główną</a></h1>`);
}

else
res.send(`<h1>Uzupełnij wszystkie dane <br> <a href='/dodaj'>Spróbuj ponownie</a></h1>`);

});


//AKTUALIZOWANIE

//wyslanie pliku
app.get("/aktualizacja", async (req,res)=>{

    let dane= await nieruchomosci.find().toArray();
    let ilosc=await nieruchomosci.find({icon: 'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    res.render('aktualizacja.ejs', {a:dane,b:ilosc});

});

//odbiór danych
app.get("/zmien", async (req,res)=>{

    const{id,cena,powierzchnia,pietro,rodzaj_budynku,miasto,ulica,typ,adres_zdjecia}=req.query;
    const{_id,_cena,_powierzchnia,_pietro, _rodzaj_budynku,_miasto,_ulica,_typ,_adres_zdjecia}=req.query;


    nieruchomosci.updateOne(
        {
            id:              Number(`${_id}`),
            cena:            Number(`${_cena}`),
            powierzchnia:    Number(`${_powierzchnia}`),
            pietro:          Number(`${_pietro}`),
            rodzaj_budynku:   `${_rodzaj_budynku}`,
            miasto:           `${_miasto}`,
            ulica:            `${_ulica}`,
            typ:              `${_typ}`,
            zdjecie:          `${_adres_zdjecia}`
        },
        {$set:{
            id:             Number(`${id}`),
            cena:           Number(`${cena}`),
            powierzchnia:   Number(`${powierzchnia}`),
            pietro:         Number(`${pietro}`),
            rodzaj_budynku:   `${rodzaj_budynku}`,
            zdjecie:          `${adres_zdjecia}`,
            miasto:           `${miasto}`,
            ulica:            `${ulica}`,
            typ:              `${typ}`
        }
    });

    res.send(`Dane zostały zaktualizowane <br> <a href='/'>Powrót na stronę główną</a>`);
});





//USUWANIE 

app.get("/usuwanie", async(req,res)=>{
    let dane=await nieruchomosci.find().toArray();
    let ilosc=await nieruchomosci.find({icon: 'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    res.render('usun.ejs',{a:dane,b:ilosc});
});

app.get("/usun", async(req,res)=>{

    const{_id,_cena,_powierzchnia,_pietro, _rodzaj_budynku,_miasto,_ulica,_typ,_adres_zdjecia}=req.query;

    nieruchomosci.deleteOne(
        {
            id:              Number(`${_id}`),
            cena:            Number(`${_cena}`),
            powierzchnia:    Number(`${_powierzchnia}`),
            pietro:          Number(`${_pietro}`),
            rodzaj_budynku:   `${_rodzaj_budynku}`,
            miasto:           `${_miasto}`,
            ulica:            `${_ulica}`,
            typ:              `${_typ}`,
            zdjecie:          `${_adres_zdjecia}`
        });

    res.send(`Dane zostały usunięte <br>
     <a href='/'>Powrót na stronę główną</a>`);

});


//ULUBIONE

app.get("/ulubione",  async (req,res)=>{    
    
    let dane=await nieruchomosci.find({icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    let{icon_src,id,cena,powierzchnia,pietro,rodzaj_budynku,miasto,ulica,typ,adres_zdjecia}=req.query;
    let adres;

    if(icon_src==='https://cdn-icons-png.flaticon.com/512/3395/3395509.png')
        adres='https://cdn-icons-png.flaticon.com/512/3756/3756555.png';

    if(icon_src==='https://cdn-icons-png.flaticon.com/512/3756/3756555.png')
        adres='https://cdn-icons-png.flaticon.com/512/3395/3395509.png'; 

    
        nieruchomosci.updateOne(
            {
                id:              Number(`${id}`),
                cena:            Number(`${cena}`),
                powierzchnia:    Number(`${powierzchnia}`),
                pietro:          Number(`${pietro}`),
                rodzaj_budynku:   `${rodzaj_budynku}`,
                miasto:           `${miasto}`,
                ulica:            `${ulica}`,
                typ:              `${typ}`,
                zdjecie:          `${adres_zdjecia}`
            },
            {$set:{
                icon: `${adres}`
            }    
        });


    //filtrowanie
    
    const{mieszkanie,wynajem,miejscowosc}=req.query;


    if ((mieszkanie==='' && wynajem==='' && miejscowosc==='') || (mieszkanie===undefined && wynajem===undefined && miejscowosc===undefined))
    {
        dane=await nieruchomosci.find({icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();
    }

    else    
    {        
    
    //po 1
    if(mieszkanie!=='' && mieszkanie!==undefined)
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    if(wynajem!=='' && wynajem!==undefined)
    dane=await nieruchomosci.find({typ:`${wynajem}` , icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    if(miejscowosc!=='' && miejscowosc!==undefined)
    dane=await nieruchomosci.find({miasto:`${miejscowosc}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    //po 2

    if(mieszkanie!=='' && mieszkanie!==undefined && wynajem!=='' && wynajem!==undefined )
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`, typ:`${wynajem}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    if(mieszkanie!=='' && mieszkanie!==undefined && miejscowosc!=='' && miejscowosc!==undefined )
    dane=await nieruchomosci.find({rodzaj_budynku:`${mieszkanie}`, miasto:`${miejscowosc}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    if(wynajem!=='' && wynajem!==undefined && miejscowosc!=='' && miejscowosc!==undefined )
    dane=await nieruchomosci.find({typ:`${wynajem}`, miasto:`${miejscowosc}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    //po 3 
    if(wynajem!=='' && wynajem!==undefined && miejscowosc!=='' && miejscowosc!==undefined && mieszkanie!=='' && mieszkanie!==undefined)
    dane=await nieruchomosci.find({rodzaj_budynku: `${mieszkanie}`, typ:`${wynajem}`, miasto:`${miejscowosc}`, icon:'https://cdn-icons-png.flaticon.com/512/3756/3756555.png'}).toArray();

    }
    res.render('ulubione.ejs',{a:dane});
   
});



app.listen(port, ()=>{
    console.log('serwer uruchomiony');
});