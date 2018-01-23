const total = {}

function getAdsenseReport() {
    if($('#cal1').val().length !== 0 && $('#cal2').val().length !== 0) {
        const date1 = $('#cal1').val().replace(/\//g,'-');
        const date2 = $('#cal2').val().replace(/\//g,'-');

        $.ajax({
            url: '/adsense', 
            method: 'POST', 
            data:{ date1: date1, date2: date2 }
        }).done((results) => {
            let data = JSON.parse(results);
            $("#result").html(`
                <p></p>
                <table style="width:100%">
                    <tr>
                        <th>date</th>
                        <th>earnings</th> 
                        <th>cost per click</th>
                        <th>individual add impression rpm</th>
                    </tr>
                    ${data.rows.map(e => {
                        if(total[e[0].split('-')[0] + e[0].split('-')[1]] === undefined) {
                            total[e[0].split('-')[1]] = [Number(e[1]), Number(e[2]), Number(e[3])]
                        } else {
                            total[e[0].split('-')[1]][0] += Number(e[1])
                            total[e[0].split('-')[1]][1] += Number(e[2])
                            total[e[0].split('-')[1]][2] += Number(e[3])
                        }
                        return `
                            <tr>
                                <td><b>${e[0].split('-')[0]}</b>年<b>${e[0].split('-')[1]}</b>月<b>${e[0].split('-')[2]}</b>日</td>
                                <td>¥${e[1]}</td>
                                <td>¥${e[2]}</td>
                                <td>¥${e[3]}</td>
                            </tr>
                        `
                    }).join('')}
                </table>
            `)

            $("#months").html(`
                ${Object.values(total).map((e, i) => {
                    
                    return `${Object.keys(total)[i]}月 ¥${e[0]} ¥${e[1]} ¥${e[2]} <br/>`
                })}
            `)
        })
    }
    return false;
}

$( ".datepicker" ).datepicker( $.datepicker.regional[ "ja" ]);

$("#submit").click(getAdsenseReport);