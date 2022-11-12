const beer = document.getElementById('randomBeer')
const randURL = "https://api.punkapi.com/v2/beers/random"

window.onload = async e => {
    try {
        const res = await fetch(`${randURL}`)
        if (res.status !== 200) {
            throw new Error("No Beers Found")
        }
        const beerData = await res.json()
        console.log(beerData)
        renderRandom(beerData)
    }
    catch (err){
        beer.innerHTML = err.message
    }
}

const renderRandom = ({
    0: {name,
    tagline,
    description,
    image_url,
    abv,
    ibu}
}) => {
    if (image_url == null) {
        beer.innerHTML = `
        <br>
        <h2>${name}: ${tagline}</h2>
        <p>${description}</p>
        <p>${name} has an abv of: ${abv}, and an IBU of: ${ibu}.
        `
    }
    else {
        beer.innerHTML = `
        <br>
        <h2>${name}: ${tagline}</h2>
        <p>${description}</p>
        <p>${name} has an abv of: ${abv}, and an IBU of: ${ibu}.
        <br>
        <br>
        <img src = "${image_url}" height = "200"></img>
        `
    }
}
