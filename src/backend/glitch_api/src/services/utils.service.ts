class UtilsService{

    public dateDiff(dt_ini:Date,dt_fim:Date,intervalo:'dia'|'anos' = 'dia'){
        let dif = dt_fim.getTime() - dt_ini.getTime();
        let divisor = 1
        switch(intervalo){
            case 'dia':
                divisor = 1000*60*60*24
            break;
            case 'anos':
                divisor = 1000*60*60*24*365
        }
        return (dif/divisor).toFixed(0)
    }

}

export default new UtilsService()